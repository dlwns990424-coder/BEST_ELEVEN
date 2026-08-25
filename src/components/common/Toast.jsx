import { createPortal } from "react-dom";

export default function Toast({ message, isOpen }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`pointer-events-none fixed left-1/2 top-[62px] z-[9999] w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2 transition-all duration-200 ${
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-lg bg-[#1A1A1A] px-4 py-3 text-center text-[14px] text-white shadow-xl ring-1 ring-[#B9E000]">
        {message}
      </div>
    </div>,
    document.body,
  );
}
