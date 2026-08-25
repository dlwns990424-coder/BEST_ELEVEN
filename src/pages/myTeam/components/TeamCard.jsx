import { ChevronRight } from "lucide-react";

export default function TeamCard({ team }) {
  const formationText = team.formation?.split("-").join(" - ") ?? "";

  return (
    <div
      className="
        flex min-h-[82px] w-full
        items-center justify-between
        rounded-[9px]
        border border-white/40
        bg-[#585353]
        px-4 py-4
      "
    >
      <div className="min-w-0">
        <h2 className="truncate text-[16px] font-normal text-white">
          {team.teamName}
        </h2>

        <p className="mt-3 text-[14px] font-normal text-white">
          {formationText}
        </p>
      </div>

      <ChevronRight
        size={22}
        strokeWidth={1.7}
        className="shrink-0 text-white"
      />
    </div>
  );
}
