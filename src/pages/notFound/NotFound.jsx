import { useNavigate } from "react-router-dom";

import homeBg from "../../../img/home.png";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", {
      replace: true,
    });
  };

  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-black bg-cover bg-center bg-no-repeat px-5 text-white"
      style={{
        backgroundImage: `url(${homeBg})`,
      }}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 404 Content */}
      <section className="relative z-10 flex w-full max-w-[390px] flex-col items-center text-center">
        <h1 className="text-[80px] font-bold leading-none text-[#B9E000]">
          404
        </h1>

        <h2 className="mt-5 text-[22px] font-semibold">
          페이지를 찾을 수 없습니다.
        </h2>

        <p className="mt-3 text-[14px] leading-6 text-white/60">
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </p>

        <button
          type="button"
          onClick={handleGoHome}
          className="
            mt-10
            flex h-[53px] w-full items-center justify-center
            rounded-lg
            bg-[#B9E000]
            text-[16px] font-bold text-[#222222]
            transition-all
            active:scale-[0.98]
            active:bg-[#9FBE00]
          "
        >
          홈으로 돌아가기
        </button>
      </section>
    </main>
  );
}
