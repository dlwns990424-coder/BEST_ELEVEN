import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

export default function PlayerImage({
  player,
  className = "",
  draggable = false,
}) {
  const [imageSrc, setImageSrc] = useState(() => {
    if (player.image) {
      return player.image;
    }

    if (player.fallbackImage) {
      return player.fallbackImage;
    }

    return "";
  });

  const [isFallback, setIsFallback] = useState(
    () => !player.image && Boolean(player.fallbackImage),
  );

  const [hasImage, setHasImage] = useState(() =>
    Boolean(player.image || player.fallbackImage),
  );

  // =========================
  // 선수가 변경될 때 이미지 초기화
  // =========================

  useEffect(() => {
    // 액션샷 이미지가 있는 경우
    if (player.image) {
      setImageSrc(player.image);
      setIsFallback(false);
      setHasImage(true);

      return;
    }

    // 액션샷은 없지만 정면 이미지가 있는 경우
    if (player.fallbackImage) {
      setImageSrc(player.fallbackImage);
      setIsFallback(true);
      setHasImage(true);

      return;
    }

    // 사용할 이미지 URL 자체가 없는 경우
    setImageSrc("");
    setIsFallback(false);
    setHasImage(false);
  }, [player.pid, player.image, player.fallbackImage]);

  // =========================
  // 이미지 로딩 실패
  // =========================

  const handleImageError = () => {
    // 액션샷 실패 → 정면 이미지
    if (!isFallback && player.fallbackImage) {
      setImageSrc(player.fallbackImage);
      setIsFallback(true);

      return;
    }

    // 정면 이미지까지 실패
    setImageSrc("");
    setHasImage(false);
  };

  // =========================
  // 이미지 없음
  // =========================

  if (!hasImage) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-white/5 text-white/30 ${className}`}
      >
        <ImageOff size={18} strokeWidth={1.5} />

        <span className="whitespace-nowrap text-[9px]">이미지 없음</span>
      </div>
    );
  }

  // =========================
  // 선수 이미지
  // =========================

  return (
    <img
      src={imageSrc}
      alt=""
      draggable={draggable}
      onError={handleImageError}
      className={className}
    />
  );
}
