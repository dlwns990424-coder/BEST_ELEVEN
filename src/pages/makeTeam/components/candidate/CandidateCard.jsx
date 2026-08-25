import { Check } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

export default function CandidateCard({
  player,
  isEditMode,
  isSelected,
  onToggleSelect,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `candidate-${player.pid}`,

    disabled: isEditMode,

    data: {
      source: "candidate",
      player,
    },
  });

  const handleClick = () => {
    if (!isEditMode) return;

    onToggleSelect(player.pid);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      {...(!isEditMode ? attributes : {})}
      {...(!isEditMode ? listeners : {})}
      className={`
        relative h-[112px] min-w-[92px] select-none overflow-hidden
        rounded-lg bg-[#585353]
        transition-all duration-150

        ${
          isEditMode
            ? "cursor-pointer active:scale-95"
            : "cursor-grab active:scale-95 active:cursor-grabbing active:bg-[#4A4646]"
        }

        ${isSelected ? "ring-2 ring-inset ring-[#B9E000]" : ""}

        ${
          isDragging
            ? "scale-105 opacity-30 ring-2 ring-inset ring-[#B9E000] shadow-xl"
            : ""
        }
      `}
    >
      {isEditMode && (
        <div
          className={`absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border ${
            isSelected
              ? "border-[#B9E000] bg-[#B9E000] text-[#333333]"
              : "border-white/50 bg-[#333333]/70"
          }`}
        >
          {isSelected && <Check size={13} strokeWidth={3} />}
        </div>
      )}

      <div className="flex h-[82px] items-end justify-center overflow-hidden">
        <img
          src={player.image}
          alt={player.name}
          draggable={false}
          className="pointer-events-none h-full w-full object-contain"
        />
      </div>

      <div className="flex h-[30px] items-center border-t border-white/10 px-2">
        <p className="truncate text-[12px]">{player.name}</p>
      </div>
    </div>
  );
}
