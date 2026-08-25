import { useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Toast from "../../components/common/Toast";
import { loginUser } from "../../lib/authStorage";

import logo from "../../../img/LOGO.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const toastTimerRef = useRef(null);

  // =========================
  // 토스트
  // =========================

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    setIsToastOpen(true);

    toastTimerRef.current = setTimeout(() => {
      setIsToastOpen(false);
    }, 2000);
  };

  // =========================
  // 로그인
  // =========================

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = loginUser(email, password);

    if (!result.success) {
      showToast(result.message);
      return;
    }

    showToast("로그인되었습니다.");

    setTimeout(() => {
      navigate("/");
    }, 700);
  };

  return (
    <main className="min-h-dvh w-full bg-[#333333] text-white">
      <Toast message={toastMessage} isOpen={isToastOpen} />

      <div className="min-h-dvh w-full px-[18px] pt-4">
        {/* 헤더 */}
        <header className="flex h-8 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="flex h-8 w-8 items-center justify-start text-white/80"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* 로고 */}
        <div className="mt-9 flex justify-center">
          <img
            src={logo}
            alt="BEST ELEVEN"
            draggable={false}
            className="h-[100px] w-[300px] object-contain"
          />
        </div>

        {/* 로그인 영역 */}
        <section className="mt-14">
          <h1 className="text-[20px] font-semibold">로그인</h1>

          <form onSubmit={handleSubmit} className="mt-5">
            {/* 이메일 */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                이메일
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="이메일을 입력하세요"
                className="auth-input h-[58px] w-full rounded-lg bg-[#585353] px-3 text-[14px] font-normal text-white outline-none placeholder:font-light placeholder:text-white/30 focus:ring-1 focus:ring-[#B9E000]"
              />
            </div>

            {/* 비밀번호 */}
            <div className="mt-4">
              <label
                htmlFor="login-password"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                비밀번호
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력하세요"
                  className="auth-input h-[58px] w-full rounded-lg bg-[#585353] px-3 pr-11 text-[14px] font-normal text-white outline-none placeholder:font-light placeholder:text-white/30 focus:ring-1 focus:ring-[#B9E000]"
                />

                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={
                    isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/40"
                >
                  {isPasswordVisible ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="mt-10 h-[53px] w-full rounded-lg bg-[#B9E000] text-[16px] font-bold text-[#222222] transition-all active:scale-[0.98] active:bg-[#9FBE00]"
            >
              로그인
            </button>
          </form>

          {/* 회원가입 유도 */}
          <div className="mt-[14px] flex items-center justify-center gap-2 text-[14px]">
            <span className="font-normal text-white/60">
              아직 계정이 없으신가요?
            </span>

            <Link to="/signup" className="font-semibold text-[#B9E000]">
              회원가입
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
