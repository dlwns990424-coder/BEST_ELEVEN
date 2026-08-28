import PlayerImage from "../../../../components/common/PlayerImage";

export default function PlayerSearchItem({
  player,
  buttonText,
  disabled,
  onAction,
}) {
  return (
    <div className="flex min-h-[76px] items-center border-b border-white/10 py-3">
      <div className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-[#585353]">
        <PlayerImage player={player} className="h-full w-full object-contain" />
      </div>

      <p className="ml-3 flex-1 truncate text-[16px]">{player.name}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction(player)}
        className={`h-9 shrink-0 rounded-lg px-4 text-[14px] font-medium ${
          disabled
            ? "cursor-default bg-[#585353] text-white/40"
            : "bg-[#B9E000] text-[#333333] transition-all active:scale-95 active:bg-[#9FBE00]"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
