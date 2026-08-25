const PLAYER_META_URL =
  "https://open.api.nexon.com/static/fconline/meta/spid.json";

const PLAYER_IMAGE_BASE_URL =
  "https://fco.dn.nexoncdn.co.kr/live/externalAssets/common/players";

let playerCache = null;
let playerPromise = null;

// spid에서 실제 선수 pid 추출
function getPidFromSpid(spid) {
  return Number(String(spid).slice(-6));
}

// 선수 이미지 URL 생성
export function getPlayerImageUrl(pid) {
  return `${PLAYER_IMAGE_BASE_URL}/p${pid}.png`;
}

// 시즌별로 존재하는 동일 선수를 pid 기준으로 하나로 합치기
function mergePlayersByPid(players) {
  const playerMap = new Map();

  players.forEach((player) => {
    const pid = getPidFromSpid(player.id);

    if (!playerMap.has(pid)) {
      playerMap.set(pid, {
        pid,
        name: player.name,
        image: getPlayerImageUrl(pid),
      });
    }
  });

  return [...playerMap.values()];
}

// 전체 선수 목록 가져오기
export async function getPlayers() {
  // 이미 데이터를 받아온 경우
  if (playerCache) {
    return playerCache;
  }

  // 현재 요청 중인 경우 동일 요청 재사용
  if (playerPromise) {
    return playerPromise;
  }

  playerPromise = fetch(PLAYER_META_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `선수 데이터를 불러오지 못했습니다. (${response.status})`,
        );
      }

      return response.json();
    })
    .then((data) => {
      playerCache = mergePlayersByPid(data);

      return playerCache;
    })
    .catch((error) => {
      playerPromise = null;

      throw error;
    });

  return playerPromise;
}

// 이름으로 선수 검색
export async function searchPlayers(keyword) {
  const searchKeyword = keyword.trim().toLowerCase();

  if (!searchKeyword) {
    return [];
  }

  const players = await getPlayers();

  return players.filter((player) =>
    player.name.toLowerCase().includes(searchKeyword),
  );
}
