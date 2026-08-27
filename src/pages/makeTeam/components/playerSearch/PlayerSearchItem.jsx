export default function PlayerSearchItem({ player, isAdded, onAddPlayer }) {
  return (
    <div className="flex min-h-[76px] items-center border-b border-white/10 py-3">
      <div className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-[#585353]">
        <img
          src={player.image}
          alt={player.name}
          className="h-full w-full object-contain"
        />
      </div>

      <p className="ml-3 flex-1 text-[16px]">{player.name}</p>

      <button
        type="button"
        disabled={isAdded}
        onClick={() => onAddPlayer(player)}
        className={`h-9 rounded-lg px-4 text-[14px] font-medium ${
          isAdded
            ? "cursor-default bg-[#585353] text-white/40"
            : "bg-[#B9E000] text-[#333333]"
        }`}
      >
        {isAdded ? "추가됨" : "추가"}
      </button>
    </div>
  );
}
