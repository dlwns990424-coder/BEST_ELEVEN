import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

export default function TeamName({ teamName, onChangeTeamName }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(teamName);

  useEffect(() => {
    setEditName(teamName);
  }, [teamName]);

  const handleEditStart = () => {
    setEditName(teamName);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setEditName(teamName);
    setIsEditMode(false);
  };

  const handleComplete = () => {
    const trimmedName = editName.trim();

    if (!trimmedName) return;

    onChangeTeamName(trimmedName);
    setIsEditMode(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleComplete();
    }

    if (event.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <section>
      {!isEditMode ? (
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">{teamName}</h2>

          <button
            type="button"
            onClick={handleEditStart}
            className="flex items-center gap-1 text-[14px] text-white/50"
          >
            <Pencil size={14} />
            수정
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              maxLength={15}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-10 w-full rounded-lg bg-[#585353] px-3 text-[16px] text-white outline-none focus:ring-1 focus:ring-[#B9E000]"
            />

            <p
              className={`mt-2 text-left text-[11px] ${
                editName.length === 15 ? "text-red-500" : "text-white/30"
              }`}
            >
              {editName.length} / 15
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="flex h-10 shrink-0 items-center text-[13px] text-white/50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={!editName.trim()}
            className={`flex h-10 shrink-0 items-center text-[13px] font-medium ${
              editName.trim()
                ? "text-[#B9E000]"
                : "cursor-default text-white/20"
            }`}
          >
            완료
          </button>
        </div>
      )}
    </section>
  );
}
