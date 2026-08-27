import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, logoutUser } from "../../lib/authStorage";

import logo from "../../../img/LOGO.png";
import homeBg from "../../../img/home.png";

export default function Home() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleMakeTeam = () => {
    navigate("/make-team");
  };

  const handleMyTeam = () => {
    navigate("/my-team");
  };

  return (
    <main
      className="relative min-h-dvh w-full overflow-hidden bg-black bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: `url(${homeBg})`,
      }}
    >
      {/* =========================
          로그인 / 회원가입 / 로그아웃
      ========================= */}
      <header className="home-safe-header flex w-full justify-end">
        {currentUser ? (
          <button
            type="button"
            onClick={handleLogout}
            className="text-[16px] font-normal text-white"
          >
            로그아웃
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[16px] font-normal text-white">
              로그인
            </Link>

            <Link
              to="/signup"
              className="
                rounded-[10px]
                border border-[#B9E000]
                px-[10px] py-[8px]
                text-[16px] font-normal
                text-[#B9E000]
                transition-all
                active:scale-95
              "
            >
              회원가입
            </Link>
          </div>
        )}
      </header>

      {/* =========================
          로고 / 타이틀
      ========================= */}
      <section className="mt-[100px] flex w-full flex-col items-center px-5">
        <img
          src={logo}
          alt="BEST ELEVEN"
          draggable={false}
          className="h-[100px] w-[300px] object-contain"
        />

        <h1 className="mt-[30px] text-center text-[24px] font-bold leading-[50px]">
          원하는 선수들을 선택하고
          <br />
          나만의 팀을 만들어 보세요
        </h1>
      </section>

      {/* =========================
          팀 생성하기
      ========================= */}
      <button
        type="button"
        onClick={handleMakeTeam}
        className="
          home-primary-action
          absolute
          flex h-[53px] items-center justify-center
          rounded-lg
          bg-[#B9E000]
          text-[16px] font-bold text-[#222222]
          transition-all
          active:scale-[0.98]
          active:bg-[#9FBE00]
        "
      >
        <span>팀 생성하기</span>

        {currentUser && (
          <ChevronRight
            size={20}
            strokeWidth={2}
            className="absolute right-4"
          />
        )}
      </button>

      {/* =========================
          로그인 후 - 내가 만든 팀
      ========================= */}
      {currentUser && (
        <button
          type="button"
          onClick={handleMyTeam}
          className="
            home-secondary-action
            absolute
            flex h-[53px] items-center justify-center
            rounded-lg
            border border-[#B9E000]
            bg-black/50
            text-[16px] font-bold
            text-[#B9E000]
            transition-all
            active:scale-[0.98]
          "
        >
          <span>내가 만든 팀</span>

          <ChevronRight
            size={20}
            strokeWidth={2}
            className="absolute right-4 text-[#B9E000]"
          />
        </button>
      )}
    </main>
  );
}
