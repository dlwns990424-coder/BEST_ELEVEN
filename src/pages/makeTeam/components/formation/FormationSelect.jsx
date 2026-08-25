import { ChevronDown, Scale } from "lucide-react";

export default function FormationSelect({ formation }) {
  const formationText = formation.split("-").join(" - ");

  return (
    <section className="mt-6">
      <p className="mb-2 text-[12px] font-normal">FORMATION</p>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex h-10 w-[145px] items-center justify-between rounded-lg bg-[#585353] px-4"
        >
          <span className="text-[14px]">{formationText}</span>

          <ChevronDown size={18} />
        </button>

        <button
          type="button"
          className="h-10 rounded-lg bg-[#B9E000] px-4 text-[14px] text-[#333333] transition-all active:scale-95 active:bg-[#9FBE00]"
        >
          랜덤 배치
        </button>
      </div>
    </section>
  );
}
