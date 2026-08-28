import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

export default function TeamName({ teamName, onChangeTeamName }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(teamName);

  // 수정 시작 전 이름 보관
  const originalNameRef = useRef(teamName);

  // 저장된 팀을 불러왔을 때 이름 동기화
  useEffect(() => {
    if (!isEditMode) {
      setEditName(teamName);
    }
  }, [teamName, isEditMode]);

  // =========================
  // 수정 시작
  // =========================

  const handleEditStart = () => {
    originalNameRef.current = teamName;

    setEditName(teamName);
    setIsEditMode(true);
  };

  // =========================
  // 이름 입력
  // =========================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setEditName(value);

    // 입력하는 순간 MakeTeam의 teamName도 변경
    if (value.trim()) {
      onChangeTeamName(value);
    }
  };

  // =========================
  // 취소
  // =========================

  const handleCancel = () => {
    const originalName = originalNameRef.current;

    setEditName(originalName);

    // 수정 전 이름으로 다시 복원
    onChangeTeamName(originalName);

    setIsEditMode(false);
  };

  // =========================
  // 완료
  // =========================

  const handleComplete = () => {
    const trimmedName = editName.trim();

    if (!trimmedName) return;

    setEditName(trimmedName);

    onChangeTeamName(trimmedName);

    setIsEditMode(false);
  };

  // =========================
  // 키보드
  // =========================

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
        <div className="flex flex-col items-start">
          <h2 className="text-[20px] font-semibold">{teamName}</h2>

          <button
            type="button"
            onClick={handleEditStart}
            className="mt-2 flex items-center gap-2 !text-[15px] text-white/50"
          >
            <Pencil size={14} strokeWidth={1.8} />
            수정
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={editName}
              onChange={handleNameChange}
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
