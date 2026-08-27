import { ChevronLeft } from "lucide-react";

export default function Header({ title, rightAction, onBack }) {
  return (
    <header className="mobile-safe-header relative flex items-center justify-between">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-start"
      >
        <ChevronLeft size={24} />
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[16px]">
        {title}
      </h1>

      <div className="flex h-10 w-10 items-center justify-end">
        {rightAction}
      </div>
    </header>
  );
}
