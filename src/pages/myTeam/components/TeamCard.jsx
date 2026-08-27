import { Check, ChevronRight } from "lucide-react";

export default function TeamCard({
  team,
  isEditMode,
  isSelected,
  onToggleSelect,
  onOpenTeam,
}) {
  const formationText = team.formation?.split("-").join(" - ") ?? "";

  const handleClick = () => {
    // 편집 중이면 팀 선택
    if (isEditMode) {
      onToggleSelect(team.id);
      return;
    }

    // 일반 상태면 저장된 팀 열기
    onOpenTeam(team.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        relative flex min-h-[82px] w-full
        items-center justify-between
        rounded-[9px]
        border border-white/40
        bg-[#585353]
        px-4 py-4
        text-left
        transition-all duration-150
        active:scale-[0.98]

        ${isSelected ? "ring-2 ring-inset ring-[#B9E000]" : ""}
      `}
    >
      <div className="min-w-0">
        <h2 className="truncate text-[16px] font-normal text-white">
          {team.teamName}
        </h2>

        <p className="mt-3 text-[14px] font-normal text-white">
          {formationText}
        </p>
      </div>

      {!isEditMode ? (
        <ChevronRight
          size={22}
          strokeWidth={1.7}
          className="shrink-0 text-white"
        />
      ) : (
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isSelected
              ? "border-[#B9E000] bg-[#B9E000] text-[#333333]"
              : "border-white/50 bg-[#333333]/70"
          }`}
        >
          {isSelected && <Check size={13} strokeWidth={3} />}
        </div>
      )}
    </button>
  );
}
