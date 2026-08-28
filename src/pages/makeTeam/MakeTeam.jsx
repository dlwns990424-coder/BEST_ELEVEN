import { useEffect, useMemo, useRef, useState } from "react";

import { Save, X } from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import Header from "../../components/common/Header";
import Toast from "../../components/common/Toast";
import PlayerImage from "../../components/common/PlayerImage";

import TeamName from "./components/team/TeamName";
import FormationSelect from "./components/formation/FormationSelect";
import FormationField from "./components/formation/FormationField";
import CandidatePlayers from "./components/candidate/CandidatePlayers";
import PlayerAddSheet from "./components/playerSearch/PlayerAddSheet";

import { FORMATIONS } from "../../data/formations";

import { getCurrentUser } from "../../lib/authStorage";

import {
  clearTempTeamDraft,
  getTeamById,
  getTempTeamDraft,
  saveTeam,
  saveTempTeamDraft,
} from "../../lib/teamStorage";

const MAX_PLAYERS = 23;

const DEFAULT_TEAM_NAME = "MY TEAM";
const DEFAULT_FORMATION = "4-3-3";

// =========================
// 변경사항 비교용 데이터 생성
// =========================

function createTeamSnapshot({
  teamName,
  formation,
  candidatePlayers,
  placedPlayers,
}) {
  const normalizedPlacedPlayers = Object.keys(placedPlayers)
    .sort()
    .reduce((result, slotId) => {
      result[slotId] = placedPlayers[slotId];

      return result;
    }, {});

  return JSON.stringify({
    teamName,
    formation,
    candidatePlayers,
    placedPlayers: normalizedPlacedPlayers,
  });
}

const DEFAULT_TEAM_SNAPSHOT = createTeamSnapshot({
  teamName: DEFAULT_TEAM_NAME,
  formation: DEFAULT_FORMATION,
  candidatePlayers: [],
  placedPlayers: {},
});

// =========================
// 포메이션 변경 시 선수 재배치
// =========================

function remapPlacedPlayersForFormation({
  currentFormation,
  nextFormation,
  placedPlayers,
}) {
  const currentSlots = FORMATIONS[currentFormation] ?? [];
  const nextSlots = FORMATIONS[nextFormation] ?? [];

  const nextPlacedPlayers = {};

  const assignedPlayerIds = new Set();

  // 같은 슬롯 ID 유지
  nextSlots.forEach((nextSlot) => {
    const player = placedPlayers[nextSlot.id];

    if (!player) {
      return;
    }

    nextPlacedPlayers[nextSlot.id] = player;

    assignedPlayerIds.add(player.pid);
  });

  // 아직 배치되지 않은 선수
  const remainingPlayers = currentSlots
    .map((slot) => ({
      player: placedPlayers[slot.id],
      type: slot.type,
    }))
    .filter(({ player }) => player && !assignedPlayerIds.has(player.pid));

  // 같은 라인 우선 배치
  nextSlots.forEach((nextSlot) => {
    if (nextPlacedPlayers[nextSlot.id]) {
      return;
    }

    if (remainingPlayers.length === 0) {
      return;
    }

    const sameTypeIndex = remainingPlayers.findIndex(
      ({ type }) => type === nextSlot.type,
    );

    const playerIndex = sameTypeIndex !== -1 ? sameTypeIndex : 0;

    const [{ player }] = remainingPlayers.splice(playerIndex, 1);

    nextPlacedPlayers[nextSlot.id] = player;
  });

  return nextPlacedPlayers;
}

export default function MakeTeam() {
  const navigate = useNavigate();
  const location = useLocation();

  const { teamId: routeTeamId } = useParams();

  const [isPlayerSheetOpen, setIsPlayerSheetOpen] = useState(false);

  // 포메이션 + 버튼으로 열었을 때 대상 슬롯
  const [targetSlotId, setTargetSlotId] = useState(null);

  const [candidatePlayers, setCandidatePlayers] = useState([]);

  const [isCandidateEditMode, setIsCandidateEditMode] = useState(false);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  const [candidateSortType, setCandidateSortType] = useState("added");

  const [placedPlayers, setPlacedPlayers] = useState({});

  const [activeDrag, setActiveDrag] = useState(null);

  // 팀 이름
  const [teamName, setTeamName] = useState(DEFAULT_TEAM_NAME);

  // 포메이션
  const [formation, setFormation] = useState(DEFAULT_FORMATION);

  // 저장된 팀 ID
  const [teamId, setTeamId] = useState(null);

  // 로그인 필요 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 나가기 모달
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // 전체 선수 삭제 모달
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  // 저장 상태
  const savedSnapshotRef = useRef(DEFAULT_TEAM_SNAPSHOT);

  // 후보 선수 영역
  const candidateSectionRef = useRef(null);

  // 토스트
  const [toastMessage, setToastMessage] = useState("");

  const [isToastOpen, setIsToastOpen] = useState(false);

  const toastTimerRef = useRef(null);

  // =========================
  // Drag Sensors
  // =========================

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 120,
      tolerance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // =========================
  // 현재 팀 상태
  // =========================

  const currentSnapshot = useMemo(
    () =>
      createTeamSnapshot({
        teamName,
        formation,
        candidatePlayers,
        placedPlayers,
      }),
    [teamName, formation, candidatePlayers, placedPlayers],
  );

  // =========================
  // 저장된 팀 / 임시 팀 불러오기
  // =========================

  useEffect(() => {
    if (location.state?.restoreDraft) {
      const tempDraft = getTempTeamDraft();

      if (tempDraft) {
        const draftTeamName = tempDraft.teamName || DEFAULT_TEAM_NAME;

        const draftFormation = tempDraft.formation || DEFAULT_FORMATION;

        const draftCandidatePlayers = Array.isArray(tempDraft.candidatePlayers)
          ? tempDraft.candidatePlayers
          : [];

        const draftPlacedPlayers =
          tempDraft.placedPlayers && typeof tempDraft.placedPlayers === "object"
            ? tempDraft.placedPlayers
            : {};

        setTeamId(tempDraft.teamId ?? routeTeamId ?? null);

        setTeamName(draftTeamName);
        setFormation(draftFormation);
        setCandidatePlayers(draftCandidatePlayers);
        setPlacedPlayers(draftPlacedPlayers);

        savedSnapshotRef.current =
          tempDraft.savedSnapshot || DEFAULT_TEAM_SNAPSHOT;

        setIsCandidateEditMode(false);
        setSelectedCandidateIds([]);

        clearTempTeamDraft();

        return;
      }
    }

    // 새 팀
    if (!routeTeamId) {
      savedSnapshotRef.current = DEFAULT_TEAM_SNAPSHOT;

      return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const savedTeam = getTeamById(routeTeamId);

    if (!savedTeam) {
      navigate("/my-team", {
        replace: true,
      });

      return;
    }

    if (savedTeam.userId !== currentUser.id) {
      navigate("/my-team", {
        replace: true,
      });

      return;
    }

    const savedTeamName = savedTeam.teamName || DEFAULT_TEAM_NAME;

    const savedFormation = savedTeam.formation || DEFAULT_FORMATION;

    const savedCandidatePlayers = Array.isArray(savedTeam.candidatePlayers)
      ? savedTeam.candidatePlayers
      : [];

    const savedPlacedPlayers =
      savedTeam.placedPlayers && typeof savedTeam.placedPlayers === "object"
        ? savedTeam.placedPlayers
        : {};

    setTeamId(savedTeam.id);
    setTeamName(savedTeamName);
    setFormation(savedFormation);
    setCandidatePlayers(savedCandidatePlayers);
    setPlacedPlayers(savedPlacedPlayers);

    savedSnapshotRef.current = createTeamSnapshot({
      teamName: savedTeamName,
      formation: savedFormation,
      candidatePlayers: savedCandidatePlayers,
      placedPlayers: savedPlacedPlayers,
    });

    setIsCandidateEditMode(false);
    setSelectedCandidateIds([]);
  }, [routeTeamId, location.state, navigate]);

  // =========================
  // 토스트
  // =========================

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    setIsToastOpen(true);

    toastTimerRef.current = setTimeout(() => {
      setIsToastOpen(false);
    }, 2000);
  };

  // =========================
  // 뒤로가기
  // =========================

  const handleBack = () => {
    const hasUnsavedChanges = currentSnapshot !== savedSnapshotRef.current;

    if (hasUnsavedChanges) {
      setIsLeaveModalOpen(true);

      return;
    }

    navigate(-1);
  };

  const handleLeaveWithoutSave = () => {
    setIsLeaveModalOpen(false);

    navigate(-1);
  };

  // =========================
  // 팀 저장
  // =========================

  const handleSaveTeam = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setIsLoginModalOpen(true);

      return;
    }

    const savedTeam = saveTeam({
      id: teamId,
      userId: currentUser.id,
      teamName,
      formation,
      candidatePlayers,
      placedPlayers,
    });

    savedSnapshotRef.current = currentSnapshot;

    const isNewTeam = !teamId || savedTeam.id !== teamId;

    if (isNewTeam) {
      setTeamId(savedTeam.id);

      navigate(`/make-team/${savedTeam.id}`, {
        replace: true,
      });

      showToast("팀이 저장되었습니다.");

      return;
    }

    showToast("팀이 수정되었습니다.");
  };

  // =========================
  // 로그인
  // =========================

  const handleGoLogin = () => {
    const returnPath =
      routeTeamId || teamId
        ? `/make-team/${routeTeamId || teamId}`
        : "/make-team";

    saveTempTeamDraft({
      teamId,
      teamName,
      formation,
      candidatePlayers,
      placedPlayers,
      savedSnapshot: savedSnapshotRef.current,
      returnPath,
    });

    setIsLoginModalOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =========================
  // 팀 이름
  // =========================

  const handleChangeTeamName = (newTeamName) => {
    setTeamName(newTeamName);
  };

  // =========================
  // 포메이션 변경
  // =========================

  const handleFormationChange = (newFormation) => {
    if (newFormation === formation) {
      return;
    }

    const nextPlacedPlayers = remapPlacedPlayersForFormation({
      currentFormation: formation,
      nextFormation: newFormation,
      placedPlayers,
    });

    setFormation(newFormation);
    setPlacedPlayers(nextPlacedPlayers);

    setIsCandidateEditMode(false);
    setSelectedCandidateIds([]);
  };

  // =========================
  // 포메이션 초기화
  // =========================

  const handleResetPlacement = () => {
    if (Object.keys(placedPlayers).length === 0) {
      return;
    }

    setPlacedPlayers({});
  };

  // =========================
  // 일반 선수 추가 시트
  // =========================

  const openPlayerSheet = () => {
    setTargetSlotId(null);
    setIsPlayerSheetOpen(true);
  };

  // =========================
  // 포메이션 + 버튼 선수 배치 시트
  // =========================

  const openPlayerSheetForSlot = (slotId) => {
    setTargetSlotId(slotId);
    setIsPlayerSheetOpen(true);
  };

  const closePlayerSheet = () => {
    setIsPlayerSheetOpen(false);
    setTargetSlotId(null);
  };

  // =========================
  // API 검색 선수 추가 / 직접 배치
  // =========================

  const handleAddPlayer = (player) => {
    const existingPlayer = candidatePlayers.find(
      (candidate) => candidate.pid === player.pid,
    );

    // 포메이션 +에서 검색한 경우
    if (targetSlotId) {
      if (!existingPlayer && candidatePlayers.length >= MAX_PLAYERS) {
        showToast("최대 23명까지 등록할 수 있습니다.");

        return;
      }

      const playerToPlace = existingPlayer ?? {
        ...player,
        addedAt: Date.now(),
      };

      // 신규 선수는 후보 목록에도 등록
      if (!existingPlayer) {
        setCandidatePlayers((prevPlayers) => [...prevPlayers, playerToPlace]);
      }

      setPlacedPlayers((prevPlayers) => {
        const nextPlayers = {
          ...prevPlayers,
        };

        // 혹시 이미 다른 슬롯에 있으면 기존 자리 제거
        const currentSlotId = Object.keys(prevPlayers).find(
          (slotId) => prevPlayers[slotId]?.pid === player.pid,
        );

        if (currentSlotId) {
          delete nextPlayers[currentSlotId];
        }

        nextPlayers[targetSlotId] = playerToPlace;

        return nextPlayers;
      });

      setIsPlayerSheetOpen(false);
      setTargetSlotId(null);

      return;
    }

    // 일반 선수 추가
    if (existingPlayer) {
      return;
    }

    if (candidatePlayers.length >= MAX_PLAYERS) {
      showToast("최대 23명까지 등록할 수 있습니다.");

      return;
    }

    setCandidatePlayers((prevPlayers) => [
      ...prevPlayers,
      {
        ...player,
        addedAt: Date.now(),
      },
    ]);
  };

  // =========================
  // 후보 선수 탭에서 바로 배치
  // =========================

  const handlePlaceCandidatePlayer = (player) => {
    if (!targetSlotId) {
      return;
    }

    setPlacedPlayers((prevPlayers) => {
      const nextPlayers = {
        ...prevPlayers,
      };

      // 안전하게 중복 배치 방지
      const currentSlotId = Object.keys(prevPlayers).find(
        (slotId) => prevPlayers[slotId]?.pid === player.pid,
      );

      if (currentSlotId) {
        delete nextPlayers[currentSlotId];
      }

      nextPlayers[targetSlotId] = player;

      return nextPlayers;
    });

    setIsPlayerSheetOpen(false);
    setTargetSlotId(null);
  };

  // =========================
  // 후보 선수 정렬
  // =========================

  const sortedCandidatePlayers = useMemo(() => {
    const sortedPlayers = [...candidatePlayers];

    if (candidateSortType === "latest") {
      return sortedPlayers.sort((a, b) => b.addedAt - a.addedAt);
    }

    if (candidateSortType === "name") {
      return sortedPlayers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    return sortedPlayers.sort((a, b) => a.addedAt - b.addedAt);
  }, [candidatePlayers, candidateSortType]);

  // =========================
  // 배치된 선수 후보 목록에서 제외
  // =========================

  const visibleCandidatePlayers = useMemo(() => {
    const placedPlayerIds = new Set(
      Object.values(placedPlayers).map((player) => player.pid),
    );

    return sortedCandidatePlayers.filter(
      (player) => !placedPlayerIds.has(player.pid),
    );
  }, [sortedCandidatePlayers, placedPlayers]);

  // =========================
  // 후보 선수 편집
  // =========================

  const handleCandidateEditStart = () => {
    setIsCandidateEditMode(true);
  };

  const handleCandidateEditComplete = () => {
    setIsCandidateEditMode(false);
    setSelectedCandidateIds([]);
  };

  const handleToggleCandidate = (pid) => {
    setSelectedCandidateIds((prevIds) => {
      const isSelected = prevIds.includes(pid);

      if (isSelected) {
        return prevIds.filter((id) => id !== pid);
      }

      return [...prevIds, pid];
    });
  };

  const handleSelectAllCandidates = () => {
    const visibleIds = visibleCandidatePlayers.map((player) => player.pid);

    const isAllSelected =
      visibleIds.length > 0 &&
      visibleIds.every((pid) => selectedCandidateIds.includes(pid));

    if (isAllSelected) {
      setSelectedCandidateIds([]);

      return;
    }

    setSelectedCandidateIds(visibleIds);
  };

  const handleSelectedCandidateDelete = () => {
    if (selectedCandidateIds.length === 0) {
      return;
    }

    const remainingPlayers = candidatePlayers.filter(
      (player) => !selectedCandidateIds.includes(player.pid),
    );

    setCandidatePlayers(remainingPlayers);

    setSelectedCandidateIds([]);

    const remainingVisiblePlayers = visibleCandidatePlayers.filter(
      (player) => !selectedCandidateIds.includes(player.pid),
    );

    if (remainingVisiblePlayers.length === 0) {
      setIsCandidateEditMode(false);
    }
  };

  // =========================
  // 전체 선수 삭제
  // =========================

  const handleDeleteAllRequest = () => {
    if (
      candidatePlayers.length === 0 &&
      Object.keys(placedPlayers).length === 0
    ) {
      return;
    }

    setIsDeleteAllModalOpen(true);
  };

  const handleDeleteAllConfirm = () => {
    setCandidatePlayers([]);
    setPlacedPlayers({});

    setSelectedCandidateIds([]);
    setIsCandidateEditMode(false);

    setActiveDrag(null);

    setIsDeleteAllModalOpen(false);

    showToast("모든 선수가 삭제되었습니다.");
  };

  // =========================
  // Fisher-Yates Shuffle
  // =========================

  const shufflePlayers = (players) => {
    const shuffledPlayers = [...players];

    for (let i = shuffledPlayers.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [shuffledPlayers[i], shuffledPlayers[randomIndex]] = [
        shuffledPlayers[randomIndex],
        shuffledPlayers[i],
      ];
    }

    return shuffledPlayers;
  };

  // =========================
  // 랜덤 배치
  // =========================

  const handleRandomPlace = () => {
    if (candidatePlayers.length === 0) {
      candidateSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      showToast("배치할 선수를 먼저 추가해주세요.");

      return;
    }

    const slots = FORMATIONS[formation] ?? [];

    if (slots.length === 0) {
      return;
    }

    const shuffledPlayers = shufflePlayers(candidatePlayers);

    const nextPlacedPlayers = {};

    slots.forEach((slot, index) => {
      const player = shuffledPlayers[index];

      if (!player) {
        return;
      }

      nextPlacedPlayers[slot.id] = player;
    });

    setPlacedPlayers(nextPlacedPlayers);

    setIsCandidateEditMode(false);
    setSelectedCandidateIds([]);
  };

  // =========================
  // Drag Start
  // =========================

  const handleDragStart = ({ active }) => {
    const dragData = active.data.current;

    if (!dragData) {
      return;
    }

    setActiveDrag(dragData);
  };

  // =========================
  // Drag Cancel
  // =========================

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  // =========================
  // Drag End
  // =========================

  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null);

    if (!over) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      return;
    }

    // 경기장 → 후보 선수
    if (activeData.source === "slot" && overData.type === "candidate-area") {
      const sourceSlotId = activeData.slotId;

      setPlacedPlayers((prevPlayers) => {
        const nextPlayers = {
          ...prevPlayers,
        };

        delete nextPlayers[sourceSlotId];

        return nextPlayers;
      });

      return;
    }

    if (overData.type !== "slot") {
      return;
    }

    const targetSlotId = overData.slotId;

    // 후보 → 경기장
    if (activeData.source === "candidate") {
      const draggedPlayer = activeData.player;

      setPlacedPlayers((prevPlayers) => {
        const nextPlayers = {
          ...prevPlayers,
        };

        const currentSlotId = Object.keys(prevPlayers).find(
          (slotId) => prevPlayers[slotId]?.pid === draggedPlayer.pid,
        );

        const targetPlayer = prevPlayers[targetSlotId];

        if (currentSlotId === targetSlotId) {
          return prevPlayers;
        }

        if (currentSlotId) {
          nextPlayers[targetSlotId] = draggedPlayer;

          if (targetPlayer) {
            nextPlayers[currentSlotId] = targetPlayer;
          } else {
            delete nextPlayers[currentSlotId];
          }

          return nextPlayers;
        }

        nextPlayers[targetSlotId] = draggedPlayer;

        return nextPlayers;
      });

      return;
    }

    // 경기장 → 경기장
    if (activeData.source === "slot") {
      const sourceSlotId = activeData.slotId;

      if (!sourceSlotId) {
        return;
      }

      if (sourceSlotId === targetSlotId) {
        return;
      }

      setPlacedPlayers((prevPlayers) => {
        const sourcePlayer = prevPlayers[sourceSlotId];

        if (!sourcePlayer) {
          return prevPlayers;
        }

        const targetPlayer = prevPlayers[targetSlotId];

        const nextPlayers = {
          ...prevPlayers,
        };

        nextPlayers[targetSlotId] = sourcePlayer;

        if (targetPlayer) {
          nextPlayers[sourceSlotId] = targetPlayer;
        } else {
          delete nextPlayers[sourceSlotId];
        }

        return nextPlayers;
      });
    }
  };

  const hasPlacedPlayers = Object.keys(placedPlayers).length > 0;

  const hasAnyPlayers = candidatePlayers.length > 0 || hasPlacedPlayers;

  const isDirectPlacement = Boolean(targetSlotId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <main className="min-h-dvh w-full bg-[#333333] text-white">
        <div className="flex min-h-dvh w-full flex-col bg-[#333333]">
          <Header
            title="팀 생성하기"
            onBack={handleBack}
            rightAction={
              <button
                type="button"
                onClick={handleSaveTeam}
                aria-label="팀 저장"
                className="flex h-10 w-10 items-center justify-end text-[#B9E000]"
              >
                <Save size={22} />
              </button>
            }
          />

          <Toast message={toastMessage} isOpen={isToastOpen} />

          <div className="px-5 pt-4">
            <TeamName
              teamName={teamName}
              onChangeTeamName={handleChangeTeamName}
            />

            <FormationSelect
              formation={formation}
              onFormationChange={handleFormationChange}
              onRandomPlace={handleRandomPlace}
              onResetPlacement={handleResetPlacement}
              hasPlacedPlayers={hasPlacedPlayers}
            />

            <FormationField
              formation={formation}
              placedPlayers={placedPlayers}
              onEmptySlotClick={openPlayerSheetForSlot}
            />
          </div>

          <div ref={candidateSectionRef} className="scroll-mt-[70px]">
            <CandidatePlayers
              players={visibleCandidatePlayers}
              hasAnyPlayers={hasAnyPlayers}
              onOpenPlayerSheet={openPlayerSheet}
              sortType={candidateSortType}
              onSortChange={setCandidateSortType}
              isEditMode={isCandidateEditMode}
              selectedCandidateIds={selectedCandidateIds}
              onEditStart={handleCandidateEditStart}
              onEditComplete={handleCandidateEditComplete}
              onToggleSelect={handleToggleCandidate}
              onSelectAll={handleSelectAllCandidates}
              onSelectedDelete={handleSelectedCandidateDelete}
              onDeleteAll={handleDeleteAllRequest}
            />
          </div>
        </div>

        <PlayerAddSheet
          isOpen={isPlayerSheetOpen}
          onClose={closePlayerSheet}
          candidatePlayers={candidatePlayers}
          availableCandidatePlayers={visibleCandidatePlayers}
          onAddPlayer={handleAddPlayer}
          onPlaceCandidatePlayer={handlePlaceCandidatePlayer}
          isDirectPlacement={isDirectPlacement}
        />
      </main>

      {/* =========================
          Drag Overlay
      ========================= */}
      <DragOverlay dropAnimation={null}>
        {activeDrag?.player ? (
          activeDrag.source === "candidate" ? (
            <div className="pointer-events-none h-[112px] w-[92px] overflow-hidden rounded-lg bg-[#585353] opacity-80 shadow-xl">
              <div className="flex h-[82px] items-end justify-center overflow-hidden">
                <PlayerImage
                  player={activeDrag.player}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex h-[30px] items-center border-t border-white/10 px-2">
                <p className="truncate text-[12px] text-white">
                  {activeDrag.player.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none h-[84px] w-[64px] overflow-hidden rounded-md bg-[#585353] opacity-80 shadow-xl">
              <div className="flex h-[64px] items-end justify-center overflow-hidden">
                <PlayerImage
                  player={activeDrag.player}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex h-[20px] items-center border-t border-white/10 px-1.5">
                <p className="w-full truncate text-center text-[9px] font-medium text-white">
                  {activeDrag.player.name}
                </p>
              </div>
            </div>
          )
        ) : null}
      </DragOverlay>

      {/* =========================
          전체 선수 삭제
      ========================= */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-[350px] rounded-xl bg-[#333333] px-5 py-6 shadow-2xl">
            <h2 className="text-center text-[18px] font-semibold text-white">
              모든 선수를 삭제하시겠습니까?
            </h2>

            <p className="mt-3 text-center text-[14px] leading-6 text-white/60">
              경기장에 배치된 선수와
              <br />
              후보 선수가 모두 삭제됩니다.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="h-[50px] flex-1 rounded-lg bg-[#585353] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleDeleteAllConfirm}
                className="h-[50px] flex-1 rounded-lg bg-red-500 text-[15px] font-semibold text-white transition-all active:scale-[0.98] active:bg-red-600"
              >
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          로그인 필요
      ========================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-5">
          <div className="relative w-full max-w-[350px] rounded-xl bg-[#333333] px-5 pb-5 pt-12 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-white/60"
            >
              <X size={20} strokeWidth={1.7} />
            </button>

            <p className="text-center text-[16px] text-white">
              팀을 저장하려면 로그인 해주세요
            </p>

            <button
              type="button"
              onClick={handleGoLogin}
              className="mt-7 h-[53px] w-full rounded-lg bg-[#B9E000] text-[16px] font-bold text-[#222222] transition-all active:scale-[0.98] active:bg-[#9FBE00]"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}

      {/* =========================
          저장하지 않고 나가기
      ========================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-[350px] rounded-xl bg-[#333333] px-5 py-6 shadow-2xl">
            <h2 className="text-center text-[18px] font-semibold text-white">
              변경사항이 저장되지 않았어요
            </h2>

            <p className="mt-3 text-center text-[14px] font-normal text-white/60">
              저장하지 않고 나가시겠습니까?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="h-[50px] flex-1 rounded-lg bg-[#585353] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleLeaveWithoutSave}
                className="h-[50px] flex-1 rounded-lg bg-[#B9E000] text-[15px] font-bold text-[#222222] transition-all active:scale-[0.98] active:bg-[#9FBE00]"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
