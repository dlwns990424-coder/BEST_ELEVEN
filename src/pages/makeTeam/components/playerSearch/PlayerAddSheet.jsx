import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { searchPlayers } from "../../../../api/playerApi";

import PlayerSearchItem from "./PlayerSearchItem";

const PAGE_SIZE = 20;

export default function PlayerAddSheet({
  isOpen,
  onClose,
  candidatePlayers,
  onAddPlayer,
}) {
  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchKeyword = keyword.trim();

    // 검색어가 바뀔 때마다 다시 20명부터 표시
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

        if (isCancelled) return;

        // 여기서 20명으로 자르지 않고
        // 검색 결과 전체를 저장
        setPlayers(result);
      } catch (error) {
        if (isCancelled) return;

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

  // 현재 화면에 보여줄 선수
  const visiblePlayers = players.slice(0, visibleCount);

  // 아직 보여주지 않은 선수가 있는지
  const hasMorePlayers = visibleCount < players.length;

  const handleLoadMore = () => {
    setVisibleCount((prevCount) =>
      Math.min(prevCount + PAGE_SIZE, players.length),
    );
  };

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
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <section
        className={`absolute bottom-0 left-1/2 flex h-[72dvh] w-full max-w-[390px] -translate-x-1/2 flex-col rounded-t-[20px] bg-[#333333] px-5 pb-8 pt-3 transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-white/30" />

        {/* Header */}
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">선수 추가</h2>

          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-end"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="선수 이름을 검색해주세요"
            className="h-12 w-full rounded-lg bg-[#585353] pl-4 pr-12 text-[16px] text-white outline-none placeholder:text-white/40"
          />

          <Search
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
          />
        </div>

        {/* Search Result */}
        <div className="mt-5 flex-1 overflow-y-auto">
          {/* 검색어 없음 */}
          {!keyword.trim() && (
            <div className="flex min-h-[160px] items-center justify-center text-center">
              <p className="text-[14px] text-white/40">
                원하는 선수의 이름을 검색해주세요
              </p>
            </div>
          )}

          {/* 로딩 */}
          {keyword.trim() && isLoading && (
            <div className="flex min-h-[160px] items-center justify-center">
              <p className="text-[14px] text-white/40">선수 검색 중...</p>
            </div>
          )}

          {/* 에러 */}
          {keyword.trim() && !isLoading && error && (
            <div className="flex min-h-[160px] items-center justify-center text-center">
              <p className="text-[14px] text-white/40">{error}</p>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {keyword.trim() && !isLoading && !error && players.length === 0 && (
            <div className="flex min-h-[160px] items-center justify-center">
              <p className="text-[14px] text-white/40">
                검색된 선수가 없습니다.
              </p>
            </div>
          )}

          {/* 검색 결과 */}
          {keyword.trim() && !isLoading && !error && players.length > 0 && (
            <>
              {visiblePlayers.map((player) => {
                const isAdded = candidatePlayers.some(
                  (candidate) => candidate.pid === player.pid,
                );

                return (
                  <PlayerSearchItem
                    key={player.pid}
                    player={player}
                    isAdded={isAdded}
                    onAddPlayer={onAddPlayer}
                  />
                );
              })}

              {/* 더보기 */}
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

              {/* 결과 개수 */}
              <p className="pb-2 text-center text-[12px] text-white/30">
                {visiblePlayers.length} / {players.length}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
