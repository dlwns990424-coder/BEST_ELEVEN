import { useMemo, useRef, useState } from "react";
import { Save } from "lucide-react";
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

import TeamName from "./components/team/TeamName";
import FormationSelect from "./components/formation/FormationSelect";
import FormationField from "./components/formation/FormationField";
import CandidatePlayers from "./components/candidate/CandidatePlayers";
import PlayerAddSheet from "./components/playerSearch/PlayerAddSheet";

const MAX_PLAYERS = 23;

export default function MakeTeam() {
  const [isPlayerSheetOpen, setIsPlayerSheetOpen] = useState(false);
  const [candidatePlayers, setCandidatePlayers] = useState([]);

  const [isCandidateEditMode, setIsCandidateEditMode] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [candidateSortType, setCandidateSortType] = useState("added");

  const [placedPlayers, setPlacedPlayers] = useState({});

  const [activeDrag, setActiveDrag] = useState(null);

  // 토스트
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const toastTimerRef = useRef(null);

  const formation = "4-3-3";

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
    if (selectedCandidateIds.length === 0) return;

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

    if (!activeData || !overData) return;

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

    if (overData.type !== "slot") return;

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
          {/* Header + 상단 Toast */}
          <Header
            title="팀 생성하기"
            rightAction={
              <button
                type="button"
                aria-label="팀 저장"
                className="flex h-10 w-10 items-center justify-end text-[#B9E000]"
              >
                <Save size={22} />
              </button>
            }
          />

          <Toast message={toastMessage} isOpen={isToastOpen} />

          <div className="px-5 pt-4">
            <TeamName teamName="MY TEAM 1" />

            <FormationSelect formation={formation} />

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
            <div className="pointer-events-none h-[112px] w-[92px] overflow-hidden rounded-lg bg-[#585353] shadow-xl">
              <div className="flex h-[82px] items-end justify-center overflow-hidden">
                <img
                  src={activeDrag.player.image}
                  alt={activeDrag.player.name}
                  draggable={false}
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
            <div className="pointer-events-none h-[76px] w-[58px] overflow-hidden rounded-md bg-[#585353] shadow-xl">
              <div className="flex h-[58px] items-end justify-center overflow-hidden">
                <img
                  src={activeDrag.player.image}
                  alt={activeDrag.player.name}
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex h-[18px] items-center border-t border-white/10 px-1.5">
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
