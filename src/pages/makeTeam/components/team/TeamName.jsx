import { Pencil } from "lucide-react";

export default function TeamName({ teamName }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold">{teamName}</h2>

        <button
          type="button"
          className="flex items-center gap-1 text-[14px] text-white/50"
        >
          <Pencil size={14} />
          수정
        </button>
      </div>
    </section>
  );
}
