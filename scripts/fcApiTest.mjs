const API_BASE_URL = "https://open.api.nexon.com";
const IMAGE_BASE_URL = "https://fco.dn.nexoncdn.co.kr";

const API_KEY = process.env.NEXON_API_KEY;

const keyword = process.argv.slice(2).join(" ").trim() || "손흥민";

if (!API_KEY) {
  console.error("❌ NEXON_API_KEY가 없습니다.");
  console.error(".env.local 파일을 확인해주세요.");
  process.exit(1);
}

// ==============================
// NEXON API 호출
// ==============================

async function fetchNexon(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "x-nxopen-api-key": API_KEY,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `API 요청 실패\nSTATUS: ${response.status}\nRESPONSE: ${text}`,
    );
  }

  return JSON.parse(text);
}

// ==============================
// spid → pid 추출
// ==============================

function getPidFromSpid(spid) {
  return Number(String(spid).slice(-6));
}

// ==============================
// 선수 이미지 URL 생성
// ==============================

function getPlayerImageUrl(pid) {
  return `${IMAGE_BASE_URL}/live/externalAssets/common/players/p${pid}.png`;
}

// ==============================
// 동일 선수 시즌 통합
// ==============================

function mergePlayersByPid(players) {
  const playerMap = new Map();

  players.forEach((player) => {
    const pid = getPidFromSpid(player.id);

    const key = `${pid}-${player.name}`;

    if (!playerMap.has(key)) {
      playerMap.set(key, {
        pid,
        name: player.name,
        spids: [],
      });
    }

    playerMap.get(key).spids.push(player.id);
  });

  return [...playerMap.values()];
}

// ==============================
// 선수 이미지 존재 확인
// ==============================

async function checkPlayerImage(pid) {
  const imageUrl = getPlayerImageUrl(pid);

  try {
    const response = await fetch(imageUrl);

    return {
      imageUrl,
      imageStatus: response.status,
      hasImage: response.ok,
    };
  } catch {
    return {
      imageUrl,
      imageStatus: "ERROR",
      hasImage: false,
    };
  }
}

// ==============================
// 테스트 시작
// ==============================

async function testApi() {
  try {
    console.log("\n============================");
    console.log("FC ONLINE PLAYER API TEST");
    console.log("============================\n");

    console.log(`🔎 검색어: ${keyword}\n`);

    // ==============================
    // 1. 선수 메타데이터
    // ==============================

    console.log("1️⃣ 선수 데이터 요청 중...");

    const playerMeta = await fetchNexon("/static/fconline/meta/spid.json");

    console.log(`✅ 전체 시즌 선수 데이터: ${playerMeta.length}개`);

    // ==============================
    // 2. 이름 검색
    // ==============================

    console.log("\n2️⃣ 이름 검색");

    const normalizedKeyword = keyword.toLowerCase();

    const matchedSeasonPlayers = playerMeta.filter((player) =>
      player.name.toLowerCase().includes(normalizedKeyword),
    );

    console.log(`시즌 카드 기준 검색 결과: ${matchedSeasonPlayers.length}개`);

    if (matchedSeasonPlayers.length === 0) {
      console.log("\n❌ 검색된 선수가 없습니다.");
      return;
    }

    // ==============================
    // 3. 동일 선수 중복 제거
    // ==============================

    console.log("\n3️⃣ 동일 선수 시즌 통합");

    const players = mergePlayersByPid(matchedSeasonPlayers);

    console.log(`✅ 실제 선수 기준 검색 결과: ${players.length}명`);

    // 검색 결과가 너무 많을 경우 콘솔 출력 제한
    const previewPlayers = players.slice(0, 20);

    console.table(
      previewPlayers.map((player) => ({
        name: player.name,
        pid: player.pid,
        seasonCount: player.spids.length,
        image: getPlayerImageUrl(player.pid),
      })),
    );

    if (players.length > 20) {
      console.log(`※ 총 ${players.length}명 중 앞의 20명만 표시했습니다.`);
    }

    // ==============================
    // 4. 정확히 일치하는 선수 찾기
    // ==============================

    console.log("\n4️⃣ 대표 선수 선택");

    const exactPlayer =
      players.find(
        (player) => player.name.toLowerCase() === normalizedKeyword,
      ) ?? players[0];

    console.log(`선수명: ${exactPlayer.name}`);
    console.log(`PID: ${exactPlayer.pid}`);
    console.log(`시즌 카드 수: ${exactPlayer.spids.length}`);

    // ==============================
    // 5. 이미지 테스트
    // ==============================

    console.log("\n5️⃣ 선수 이미지 테스트");

    const imageResult = await checkPlayerImage(exactPlayer.pid);

    console.log(`이미지 URL: ${imageResult.imageUrl}`);
    console.log(`이미지 STATUS: ${imageResult.imageStatus}`);

    if (imageResult.hasImage) {
      console.log("✅ 선수 이미지 정상");
    } else {
      console.log("⚠️ 선수 이미지가 없습니다.");
    }

    // ==============================
    // 6. 최종 데이터
    // ==============================

    const finalPlayer = {
      pid: exactPlayer.pid,
      name: exactPlayer.name,
      image: imageResult.hasImage ? imageResult.imageUrl : null,
    };

    console.log("\n============================");
    console.log("✅ 최종 선수 데이터");
    console.log("============================\n");

    console.log(finalPlayer);

    console.log("\n============================");
    console.log("테스트 완료");
    console.log("============================\n");
  } catch (error) {
    console.error("\n❌ API 테스트 실패");
    console.error(error);
  }
}

testApi();
