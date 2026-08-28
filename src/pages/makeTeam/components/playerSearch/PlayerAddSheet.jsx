import { useEffect, useMemo, useState } from "react";

import { Search, X } from "lucide-react";

import { searchPlayers } from "../../../../api/playerApi";

import PlayerSearchItem from "./PlayerSearchItem";

const PAGE_SIZE = 20;

export default function PlayerAddSheet({
  isOpen,
  onClose,
  candidatePlayers,
  availableCandidatePlayers,
  onAddPlayer,
  onPlaceCandidatePlayer,
  isDirectPlacement,
}) {
  const [activeTab, setActiveTab] = useState("search");

  // API 선수 검색
  const [keyword, setKeyword] = useState("");

  const [players, setPlayers] = useState([]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  // 후보 선수 검색
  const [candidateKeyword, setCandidateKeyword] = useState("");

  // =========================
  // Bottom Sheet 열림
  // 배경 스크롤 잠금
  // =========================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollY = window.scrollY;

    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalLeft = document.body.style.left;
    const originalRight = document.body.style.right;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.right = originalRight;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // =========================
  // 닫혔을 때 검색 상태 초기화
  // =========================

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setActiveTab("search");

    setKeyword("");
    setPlayers([]);
    setVisibleCount(PAGE_SIZE);
    setIsLoading(false);
    setError("");

    setCandidateKeyword("");
  }, [isOpen]);

  // =========================
  // 일반 선수 추가로 열렸다면
  // 항상 선수 검색 탭 사용
  // =========================

  useEffect(() => {
    if (!isDirectPlacement) {
      setActiveTab("search");
    }
  }, [isDirectPlacement]);

  // =========================
  // API 선수 검색
  // =========================

  useEffect(() => {
    const searchKeyword = keyword.trim();

    setVisibleCount(PAGE_SIZE);

    if (!searchKeyword) {
      setPlayers([]);
      setError("");
      setIsLoading(false);

      return;
    }

    let isCancelled = false;

    const search = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await searchPlayers(searchKeyword);

        if (isCancelled) {
          return;
        }

        setPlayers(result);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("선수 검색 실패:", error);

        setPlayers([]);

        setError("선수 검색 중 오류가 발생했습니다.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    search();

    return () => {
      isCancelled = true;
    };
  }, [keyword]);

  // =========================
  // 닫기
  // =========================

  const handleClose = () => {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    setActiveTab("search");

    setKeyword("");
    setPlayers([]);
    setVisibleCount(PAGE_SIZE);
    setIsLoading(false);
    setError("");

    setCandidateKeyword("");

    onClose();
  };

  // =========================
  // API 검색 결과
  // =========================

  const visiblePlayers = players.slice(0, visibleCount);

  const hasMorePlayers = visibleCount < players.length;

  const handleLoadMore = () => {
    setVisibleCount((prevCount) =>
      Math.min(prevCount + PAGE_SIZE, players.length),
    );
  };

  // =========================
  // 후보 선수 검색
  // =========================

  const filteredCandidatePlayers = useMemo(() => {
    const searchKeyword = candidateKeyword.trim().toLowerCase();

    if (!searchKeyword) {
      return availableCandidatePlayers;
    }

    return availableCandidatePlayers.filter((player) =>
      player.name.toLowerCase().includes(searchKeyword),
    );
  }, [availableCandidatePlayers, candidateKeyword]);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* 배경 */}
      <button
        type="button"
        aria-label="선수 추가 닫기"
        onClick={handleClose}
        className={`absolute inset-0 h-full w-full bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <section
        className={`bottom-sheet-safe absolute bottom-0 left-1/2 flex h-[72dvh] w-full max-w-[390px] -translate-x-1/2 flex-col overscroll-contain rounded-t-[20px] bg-[#333333] pt-3 transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-white/30" />

        {/* Header */}
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">
            {isDirectPlacement ? "선수 배치" : "선수 추가"}
          </h2>

          <button
            type="button"
            aria-label="닫기"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-end"
          >
            <X size={22} />
          </button>
        </div>

        {/* =========================
            포메이션 +에서 들어왔을 때만 탭 표시
        ========================= */}
        {isDirectPlacement && (
          <div className="mt-4 grid grid-cols-2 rounded-lg bg-[#585353] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={`h-10 rounded-md text-[14px] font-medium transition-colors ${
                activeTab === "search"
                  ? "bg-[#B9E000] text-[#333333]"
                  : "text-white/60"
              }`}
            >
              선수 검색
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("candidate")}
              className={`h-10 rounded-md text-[14px] font-medium transition-colors ${
                activeTab === "candidate"
                  ? "bg-[#B9E000] text-[#333333]"
                  : "text-white/60"
              }`}
            >
              후보 선수
            </button>
          </div>
        )}

        {/* =========================
            선수 검색 탭
        ========================= */}
        {activeTab === "search" && (
          <>
            {/* Search */}
            <div className="relative mt-5">
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="선수 이름을 검색해주세요"
                enterKeyHint="search"
                autoComplete="off"
                className="h-12 w-full rounded-lg bg-[#585353] pl-4 pr-12 text-[16px] text-white outline-none placeholder:text-white/40 placeholder:font-light"
              />

              <Search
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
              />
            </div>

            {/* Search Result */}
            <div className="mt-5 flex-1 touch-pan-y overflow-y-auto overscroll-contain scroll-pb-6">
              {!keyword.trim() && (
                <div className="flex min-h-[160px] items-center justify-center text-center">
                  <p className="text-[14px] text-white/40">
                    원하는 선수의 이름을 검색해주세요
                  </p>
                </div>
              )}

              {keyword.trim() && isLoading && (
                <div className="flex min-h-[160px] items-center justify-center">
                  <p className="text-[14px] text-white/40">선수 검색 중...</p>
                </div>
              )}

              {keyword.trim() && !isLoading && error && (
                <div className="flex min-h-[160px] items-center justify-center text-center">
                  <p className="text-[14px] text-white/40">{error}</p>
                </div>
              )}

              {keyword.trim() &&
                !isLoading &&
                !error &&
                players.length === 0 && (
                  <div className="flex min-h-[160px] items-center justify-center">
                    <p className="text-[14px] text-white/40">
                      검색된 선수가 없습니다.
                    </p>
                  </div>
                )}

              {keyword.trim() && !isLoading && !error && players.length > 0 && (
                <>
                  {visiblePlayers.map((player) => {
                    const isAdded = candidatePlayers.some(
                      (candidate) => candidate.pid === player.pid,
                    );

                    const buttonText = isAdded
                      ? "추가됨"
                      : isDirectPlacement
                        ? "배치"
                        : "추가";

                    return (
                      <PlayerSearchItem
                        key={player.pid}
                        player={player}
                        buttonText={buttonText}
                        disabled={isAdded}
                        onAction={onAddPlayer}
                      />
                    );
                  })}

                  {hasMorePlayers && (
                    <div className="py-5">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="h-11 w-full rounded-lg border border-white/15 text-[14px] text-white/70 transition-all duration-150 active:scale-[0.98] active:bg-white/5"
                      >
                        더보기
                      </button>
                    </div>
                  )}

                  <p className="pb-2 mt-2 text-center text-[12px] text-white/30">
                    {visiblePlayers.length} / {players.length}
                  </p>
                </>
              )}
            </div>
          </>
        )}

        {/* =========================
            후보 선수 탭
        ========================= */}
        {isDirectPlacement && activeTab === "candidate" && (
          <>
            {/* 후보 검색 */}
            <div className="relative mt-5">
              <input
                type="search"
                value={candidateKeyword}
                onChange={(event) => setCandidateKeyword(event.target.value)}
                placeholder="후보 선수를 검색해주세요"
                enterKeyHint="search"
                autoComplete="off"
                className="h-12 w-full rounded-lg bg-[#585353] pl-4 pr-12 text-[16px] text-white outline-none placeholder:text-white/40 placeholder:font-light"
              />

              <Search
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
              />
            </div>

            {/* 후보 목록 */}
            <div className="mt-5 flex-1 touch-pan-y overflow-y-auto overscroll-contain scroll-pb-6">
              {availableCandidatePlayers.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center text-center">
                  <p className="text-[14px] text-white/40">
                    배치할 수 있는 후보 선수가 없습니다.
                  </p>
                </div>
              ) : filteredCandidatePlayers.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center text-center">
                  <p className="text-[14px] text-white/40">
                    검색된 후보 선수가 없습니다.
                  </p>
                </div>
              ) : (
                <>
                  {filteredCandidatePlayers.map((player) => (
                    <PlayerSearchItem
                      key={player.pid}
                      player={player}
                      buttonText="배치"
                      disabled={false}
                      onAction={onPlaceCandidatePlayer}
                    />
                  ))}

                  <p className="pb-2 pt-4 text-center text-[12px] text-white/30">
                    {filteredCandidatePlayers.length}명
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
