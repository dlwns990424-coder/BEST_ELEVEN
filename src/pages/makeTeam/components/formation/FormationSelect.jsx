import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { FORMATIONS } from "../../../../data/formations";

export default function FormationSelect({
  formation,
  onFormationChange,
  onRandomPlace,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formationRef = useRef(null);

  const formationOptions = Object.keys(FORMATIONS);

  const formationText = formation.split("-").join(" - ");

  // =========================
  // 포메이션 선택
  // =========================

  const handleFormationSelect = (selectedFormation) => {
    onFormationChange(selectedFormation);
    setIsOpen(false);
  };

  // =========================
  // 바깥 영역 클릭 시 닫기
  // =========================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        formationRef.current &&
        !formationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  return (
    <section className="mt-6">
      <p className="mb-2 text-[14px] font-normal">FORMATION</p>

      <div className="flex items-center justify-between">
        <div ref={formationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex h-10 w-[145px] items-center justify-between rounded-lg bg-[#585353] px-4"
          >
            <span className="text-[14px]">{formationText}</span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-[48px] z-50 w-[145px] overflow-hidden rounded-lg bg-[#1A1A1A] shadow-xl ring-1 ring-white/10">
              {formationOptions.map((option) => {
                const isSelected = formation === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFormationSelect(option)}
                    className={`flex h-10 w-full items-center justify-between px-4 text-left text-[14px] transition-colors ${
                      isSelected
                        ? "bg-[#B9E000]/10 text-[#B9E000]"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{option.split("-").join(" - ")}</span>

                    {isSelected && <Check size={14} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRandomPlace}
          className="h-10 rounded-lg bg-[#B9E000] px-4 text-[14px] text-[#333333] transition-all duration-150 active:scale-95 active:bg-[#9FBE00]"
        >
          랜덤 배치
        </button>
      </div>
    </section>
  );
}
