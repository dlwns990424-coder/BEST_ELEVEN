import { ChevronDown, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";

import CandidateCard from "./CandidateCard";

const SORT_OPTIONS = [
  {
    value: "added",
    label: "추가순",
  },
  {
    value: "latest",
    label: "최근 추가순",
  },
  {
    value: "name",
    label: "이름순",
  },
];

export default function CandidatePlayers({
  players,
  onOpenPlayerSheet,

  sortType,
  onSortChange,

  isEditMode,
  selectedCandidateIds,

  onEditStart,
  onEditComplete,
  onToggleSelect,
  onSelectAll,
  onSelectedDelete,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: "candidate-area",
    data: {
      type: "candidate-area",
    },
  });

  const hasPlayers = players.length > 0;

  const isAllSelected =
    hasPlayers &&
    players.every((player) => selectedCandidateIds.includes(player.pid));

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortType)?.label ?? "추가순";

  const handleSortChange = (value) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <section
      ref={setNodeRef}
      className={`mt-[30px] w-full bg-[#1A1A1A] px-5 py-5 transition ${
        isOver ? "ring-2 ring-inset ring-[#B9E000]/50" : ""
      }`}
    >
      {/* 제목 / 선수 추가 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-medium">후보 선수</h2>

        <button
          type="button"
          onClick={onOpenPlayerSheet}
          className="flex items-center gap-1 text-[14px] font-normal text-[#B9E000]"
        >
          <Plus size={15} />
          선수 추가
        </button>
      </div>

      {/* 정렬 / 편집 */}
      {hasPlayers && !isEditMode && (
        <div className="mt-3 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onEditStart}
            className="text-[12px] text-white/50"
          >
            편집
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[12px] text-white/50"
            >
              {currentSortLabel}

              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-[26px] z-20 min-w-[150px] overflow-hidden rounded-lg bg-[#333333] py-1 shadow-lg">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSortChange(option.value)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-white/70 hover:bg-white/5"
                  >
                    {option.label}

                    {sortType === option.value && (
                      <Check size={13} className="text-[#B9E000]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 편집 모드 */}
      {hasPlayers && isEditMode && (
        <div className="mt-3 flex w-full items-center justify-end gap-5">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[12px] text-white/50"
          >
            {isAllSelected ? "전체 해제" : "전체 선택"}
          </button>

          <button
            type="button"
            disabled={selectedCandidateIds.length === 0}
            onClick={onSelectedDelete}
            className={`text-[12px] ${
              selectedCandidateIds.length === 0
                ? "cursor-default text-white/20"
                : "text-white/50"
            }`}
          >
            선택 삭제
          </button>

          <button
            type="button"
            onClick={onEditComplete}
            className="text-[12px] font-medium text-[#B9E000]"
          >
            완료
          </button>
        </div>
      )}

      {/* 후보 없음 */}
      {!hasPlayers ? (
        <div className="mt-4 flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-[#585353]/60 px-5 text-center">
          <p className="text-[16px]">등록된 선수가 없어요</p>

          <p className="mt-2 text-[14px] text-white/50">
            선수 추가로 원하는 선수를 등록해보세요
          </p>
        </div>
      ) : (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {players.map((player) => (
            <CandidateCard
              key={player.pid}
              player={player}
              isEditMode={isEditMode}
              isSelected={selectedCandidateIds.includes(player.pid)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
