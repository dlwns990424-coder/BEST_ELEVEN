const USERS_KEY = "best_eleven_users";
const CURRENT_USER_KEY = "best_eleven_current_user";

// =========================
// 전체 회원 조회
// =========================

export function getUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);

    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

// =========================
// 회원가입
// =========================

export function signUpUser(nickname, email, password) {
  const users = getUsers();

  const trimmedNickname = nickname.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const isDuplicated = users.some((user) => user.email === normalizedEmail);

  if (isDuplicated) {
    return {
      success: false,
      message: "이미 가입된 이메일입니다.",
    };
  }

  const newUser = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `user-${Date.now()}`,
    nickname: trimmedNickname,
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

  return {
    success: true,
    user: newUser,
  };
}

// =========================
// 로그인
// =========================

export function loginUser(email, password) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (savedUser) =>
      savedUser.email === normalizedEmail && savedUser.password === password,
  );

  if (!user) {
    return {
      success: false,
      message: "이메일 또는 비밀번호를 확인해주세요.",
    };
  }

  const currentUser = {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return {
    success: true,
    user: currentUser,
  };
}

// =========================
// 현재 로그인 사용자
// =========================

export function getCurrentUser() {
  try {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);

    return currentUser ? JSON.parse(currentUser) : null;
  } catch {
    return null;
  }
}

// =========================
// 로그아웃
// =========================

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
