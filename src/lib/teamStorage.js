const TEAMS_KEY = "best_eleven_teams";
const TEMP_TEAM_DRAFT_KEY = "best_eleven_temp_team_draft";

// =========================
// 전체 팀 조회
// =========================

export function getTeams() {
  try {
    const teams = localStorage.getItem(TEAMS_KEY);

    return teams ? JSON.parse(teams) : [];
  } catch {
    return [];
  }
}

// =========================
// 사용자별 팀 조회
// =========================

export function getTeamsByUserId(userId) {
  const teams = getTeams();

  return teams.filter((team) => team.userId === userId);
}

// =========================
// 팀 1개 조회
// =========================

export function getTeamById(teamId) {
  const teams = getTeams();

  return teams.find((team) => team.id === teamId) ?? null;
}

// =========================
// 팀 저장 / 수정
// =========================

export function saveTeam(teamData) {
  const teams = getTeams();

  const now = new Date().toISOString();

  // 기존 팀 수정
  if (teamData.id) {
    const teamIndex = teams.findIndex(
      (team) => team.id === teamData.id && team.userId === teamData.userId,
    );

    if (teamIndex !== -1) {
      const updatedTeam = {
        ...teams[teamIndex],
        ...teamData,

        createdAt: teams[teamIndex].createdAt,
        updatedAt: now,
      };

      const nextTeams = [...teams];

      nextTeams[teamIndex] = updatedTeam;

      localStorage.setItem(TEAMS_KEY, JSON.stringify(nextTeams));

      return updatedTeam;
    }
  }

  // 새 팀 생성
  const newTeam = {
    ...teamData,

    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `team-${Date.now()}`,

    createdAt: now,
    updatedAt: now,
  };

  localStorage.setItem(TEAMS_KEY, JSON.stringify([...teams, newTeam]));

  return newTeam;
}

// =========================
// 팀 삭제
// =========================

export function deleteTeam(teamId, userId) {
  const teams = getTeams();

  const nextTeams = teams.filter(
    (team) => !(team.id === teamId && team.userId === userId),
  );

  localStorage.setItem(TEAMS_KEY, JSON.stringify(nextTeams));
}

// =========================
// 로그인 전 임시 팀 저장
// =========================

export function saveTempTeamDraft(draft) {
  try {
    sessionStorage.setItem(TEMP_TEAM_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

// =========================
// 로그인 전 임시 팀 조회
// =========================

export function getTempTeamDraft() {
  try {
    const draft = sessionStorage.getItem(TEMP_TEAM_DRAFT_KEY);

    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

// =========================
// 로그인 전 임시 팀 삭제
// =========================

export function clearTempTeamDraft() {
  sessionStorage.removeItem(TEMP_TEAM_DRAFT_KEY);
}
