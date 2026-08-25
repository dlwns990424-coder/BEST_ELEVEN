import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/common/Header";
import TeamCard from "./components/TeamCard";

import { getCurrentUser } from "../../lib/authStorage";
import { getTeamsByUserId } from "../../lib/teamStorage";

export default function MyTeam() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [teams] = useState(() => {
    if (!currentUser) {
      return [];
    }

    return getTeamsByUserId(currentUser.id);
  });

  const [sortType, setSortType] = useState("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortRef = useRef(null);

  // =========================
  // 로그인 확인
  // =========================

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  // =========================
  // 정렬
  // =========================

  const sortedTeams = useMemo(() => {
    const nextTeams = [...teams];

    if (sortType === "oldest") {
      return nextTeams.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    if (sortType === "name") {
      return nextTeams.sort((a, b) =>
        a.teamName.localeCompare(b.teamName, "ko"),
      );
    }

    // 최신순
    return nextTeams.sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    );
  }, [teams, sortType]);

  // =========================
  // 정렬 드롭다운 바깥 클릭
  // =========================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  // =========================
  // 정렬 선택
  // =========================

  const handleSortChange = (nextSortType) => {
    setSortType(nextSortType);
    setIsSortOpen(false);
  };

  const sortLabel = {
    latest: "최신순",
    oldest: "오래된순",
    name: "이름순",
  };

  return (
    <main className="min-h-dvh w-full bg-[#333333] text-white">
      <Header
        title="내가 만든 팀"
        onBack={() => navigate(-1)}
        rightAction={
          <span className="text-[14px] font-normal text-[#B9E000]">편집</span>
        }
      />

      <section className="w-full px-5 pb-8">
        {/* =========================
            정렬
        ========================= */}
        <div className="mt-7 flex justify-end">
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex h-9 items-center gap-2 text-[14px] font-normal text-white"
            >
              <span>{sortLabel[sortType]}</span>

              <ChevronDown
                size={18}
                strokeWidth={1.7}
                className={`transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-[42px] z-50 w-[120px] overflow-hidden rounded-lg bg-[#1A1A1A] shadow-xl ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => handleSortChange("latest")}
                  className={`flex h-10 w-full items-center justify-between px-3 text-[13px] ${
                    sortType === "latest" ? "text-[#B9E000]" : "text-white"
                  }`}
                >
                  <span>최신순</span>

                  {sortType === "latest" && (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSortChange("oldest")}
                  className={`flex h-10 w-full items-center justify-between px-3 text-[13px] ${
                    sortType === "oldest" ? "text-[#B9E000]" : "text-white"
                  }`}
                >
                  <span>오래된순</span>

                  {sortType === "oldest" && (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSortChange("name")}
                  className={`flex h-10 w-full items-center justify-between px-3 text-[13px] ${
                    sortType === "name" ? "text-[#B9E000]" : "text-white"
                  }`}
                >
                  <span>이름순</span>

                  {sortType === "name" && <Check size={14} strokeWidth={2.5} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            팀 목록
        ========================= */}
        {sortedTeams.length > 0 ? (
          <div className="mt-2 flex flex-col gap-4">
            {sortedTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <p className="text-[14px] font-normal text-white/40">
              아직 저장한 팀이 없습니다.
            </p>

            <button
              type="button"
              onClick={() => navigate("/make-team")}
              className="mt-5 h-[45px] rounded-lg bg-[#B9E000] px-5 text-[14px] font-semibold text-[#222222] transition-all active:scale-95 active:bg-[#9FBE00]"
            >
              팀 만들기
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
