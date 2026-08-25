import { Plus } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export default function PlayerSlot({ slotId, type, label, className, player }) {
  const typeStyle = {
    fw: "border-[#C94E38] bg-[#C94E38]/70",
    mf: "border-[#24DB54] bg-[#24DB54]/70",
    df: "border-[#377AC8] bg-[#377AC8]/70",
    gk: "border-[#D7E832] bg-[#D7E832]/70",
  };

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `slot-${slotId}`,

    data: {
      type: "slot",
      slotId,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging,
  } = useDraggable({
    id: `placed-${slotId}`,

    disabled: !player,

    data: {
      source: "slot",
      slotId,
      player,
    },
  });

  return (
    <div className={`absolute h-9 w-9 ${className}`}>
      {player ? (
        <div
          ref={setDroppableNodeRef}
          className="absolute left-1/2 top-1/2 h-[76px] w-[58px] -translate-x-1/2 -translate-y-1/2"
        >
          <div
            ref={setDraggableNodeRef}
            {...attributes}
            {...listeners}
            style={{
              touchAction: "none",
            }}
            className={`
              relative h-full w-full select-none overflow-hidden
              rounded-md bg-[#585353] shadow-md
              transition-all duration-150
              cursor-grab
              active:scale-95
              active:cursor-grabbing
              active:bg-[#4A4646]

              ${
                isDragging
                  ? "scale-105 opacity-30 ring-2 ring-inset ring-[#B9E000] shadow-xl"
                  : ""
              }

              ${isOver ? "scale-105 ring-2 ring-inset ring-[#B9E000]" : ""}
            `}
          >
            <div className="flex h-[58px] items-end justify-center overflow-hidden">
              <img
                src={player.image}
                alt={player.name}
                draggable={false}
                className="pointer-events-none h-full w-full object-contain"
              />
            </div>

            <div className="flex h-[18px] items-center border-t border-white/10 px-1.5">
              <p className="w-full truncate text-center text-[9px] font-medium text-white">
                {player.name}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          ref={setDroppableNodeRef}
          type="button"
          aria-label={`${label} 선수 배치`}
          className={`
            absolute left-1/2 top-1/2
            flex h-9 w-9
            -translate-x-1/2 -translate-y-1/2
            items-center justify-center
            rounded-full border-2 text-[#222222]
            transition-all duration-150
            ${typeStyle[type]}

            ${
              isOver
                ? "scale-110 ring-2 ring-[#B9E000] ring-offset-2 ring-offset-transparent"
                : ""
            }
          `}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
