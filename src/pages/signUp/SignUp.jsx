import { useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Toast from "../../components/common/Toast";
import { signUpUser } from "../../lib/authStorage";

import logo from "../../../img/LOGO.png";

export default function SignUp() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
  // 회원가입
  // =========================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!nickname.trim()) {
      showToast("닉네임을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }

    const result = signUpUser(nickname, email, password);

    if (!result.success) {
      showToast(result.message);
      return;
    }

    setNickname("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");

    setIsSuccessModalOpen(true);
  };

  // =========================
  // 회원가입 완료
  // =========================

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    navigate("/login");
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

        {/* 회원가입 영역 */}
        <section className="mt-14">
          <h1 className="text-[20px] font-semibold">회원가입</h1>

          <form onSubmit={handleSubmit} className="mt-5">
            {/* 닉네임 */}
            <div>
              <label
                htmlFor="signup-nickname"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                닉네임
              </label>

              <input
                id="signup-nickname"
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                required
                autoComplete="nickname"
                placeholder="닉네임을 입력하세요"
                className="auth-input h-[58px] w-full rounded-lg bg-[#585353] px-3 text-[14px] font-normal text-white outline-none placeholder:font-light placeholder:text-white/30 focus:ring-1 focus:ring-[#B9E000]"
              />
            </div>

            {/* 이메일 */}
            <div className="mt-4">
              <label
                htmlFor="signup-email"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                이메일
              </label>

              <input
                id="signup-email"
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
                htmlFor="signup-password"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                비밀번호
              </label>

              <div className="relative">
                <input
                  id="signup-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* 비밀번호 확인 */}
            <div className="mt-4">
              <label
                htmlFor="signup-password-confirm"
                className="mb-2 block text-[14px] font-normal text-white/70"
              >
                비밀번호 확인
              </label>

              <div className="relative">
                <input
                  id="signup-password-confirm"
                  type={isPasswordConfirmVisible ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호를 입력하세요"
                  className="auth-input h-[58px] w-full rounded-lg bg-[#585353] px-3 pr-11 text-[14px] font-normal text-white outline-none placeholder:font-light placeholder:text-white/30 focus:ring-1 focus:ring-[#B9E000]"
                />

                <button
                  type="button"
                  onClick={() => setIsPasswordConfirmVisible((prev) => !prev)}
                  aria-label={
                    isPasswordConfirmVisible
                      ? "비밀번호 숨기기"
                      : "비밀번호 보기"
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/40"
                >
                  {isPasswordConfirmVisible ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="mt-10 h-[53px] w-full rounded-lg bg-[#B9E000] text-[16px] font-bold text-[#222222] transition-all active:scale-[0.98] active:bg-[#9FBE00]"
            >
              회원가입
            </button>
          </form>

          {/* 로그인 유도 */}
          <div className="mt-[14px] flex items-center justify-center gap-2 text-[14px]">
            <span className="font-normal text-white/60">
              이미 계정이 있으신가요?
            </span>

            <Link to="/login" className="font-semibold text-[#B9E000]">
              로그인
            </Link>
          </div>
        </section>
      </div>

      {/* =========================
          회원가입 완료 모달
      ========================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-[350px] rounded-xl bg-[#333333] px-5 py-6 shadow-2xl">
            <h2 className="text-center text-[18px] font-semibold text-white">
              회원가입 완료
            </h2>

            <p className="mt-3 text-center text-[14px] font-normal text-white/70">
              회원가입이 완료되었습니다.
            </p>

            <button
              type="button"
              onClick={handleSuccessConfirm}
              className="mt-6 h-[53px] w-full rounded-lg bg-[#B9E000] text-[16px] font-bold text-[#222222] transition-all active:scale-[0.98] active:bg-[#9FBE00]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
