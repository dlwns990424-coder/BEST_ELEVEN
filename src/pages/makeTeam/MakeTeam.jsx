import { useMemo, useRef, useState } from "react";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { saveTeam } from "../../lib/teamStorage";

const MAX_PLAYERS = 23;

export default function MakeTeam() {
  const navigate = useNavigate();

  const [isPlayerSheetOpen, setIsPlayerSheetOpen] = useState(false);

  const [candidatePlayers, setCandidatePlayers] = useState([]);

  const [isCandidateEditMode, setIsCandidateEditMode] = useState(false);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  const [candidateSortType, setCandidateSortType] = useState("added");

  const [placedPlayers, setPlacedPlayers] = useState({});

  const [activeDrag, setActiveDrag] = useState(null);

  // 팀 이름
  const [teamName, setTeamName] = useState("MY TEAM 1");

  // 포메이션
  const [formation, setFormation] = useState("4-3-3");

  // 저장된 팀 ID
  const [teamId, setTeamId] = useState(null);

  // 토스트
  const [toastMessage, setToastMessage] = useState("");

  const [isToastOpen, setIsToastOpen] = useState(false);

  const toastTimerRef = useRef(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 180,
      tolerance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

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
    navigate(-1);
  };

  // =========================
  // 팀 저장
  // =========================

  const handleSaveTeam = () => {
    const currentUser = getCurrentUser();

    // 로그인하지 않은 경우
    if (!currentUser) {
      showToast("로그인이 필요합니다.");

      setTimeout(() => {
        navigate("/login");
      }, 700);

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

    // 첫 저장 후 ID 기억
    if (!teamId) {
      setTeamId(savedTeam.id);
    }

    showToast(teamId ? "팀이 수정되었습니다." : "팀이 저장되었습니다.");
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

    setFormation(newFormation);

    // 포메이션 변경 시 기존 배치 해제
    setPlacedPlayers({});

    setIsCandidateEditMode(false);
    setSelectedCandidateIds([]);
  };

  // =========================
  // 선수 추가 시트
  // =========================

  const openPlayerSheet = () => {
    if (candidatePlayers.length >= MAX_PLAYERS) {
      showToast("최대 23명까지 등록할 수 있습니다.");

      return;
    }

    setIsPlayerSheetOpen(true);
  };

  const closePlayerSheet = () => {
    setIsPlayerSheetOpen(false);
  };

  // =========================
  // 선수 추가
  // =========================

  const handleAddPlayer = (player) => {
    const isAlreadyAdded = candidatePlayers.some(
      (candidate) => candidate.pid === player.pid,
    );

    if (isAlreadyAdded) {
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
  // 경기장 선수 제외
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

      if (!player) return;

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

    if (!dragData) return;

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

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      return;
    }

    // 경기장 → 후보 선수 영역
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

    // 후보 선수 → 경기장
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

      if (!sourceSlotId) return;

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
            />

            <FormationField
              formation={formation}
              placedPlayers={placedPlayers}
            />
          </div>

          <CandidatePlayers
            players={visibleCandidatePlayers}
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
          />
        </div>

        <PlayerAddSheet
          isOpen={isPlayerSheetOpen}
          onClose={closePlayerSheet}
          candidatePlayers={candidatePlayers}
          onAddPlayer={handleAddPlayer}
        />
      </main>

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
    </DndContext>
  );
}
