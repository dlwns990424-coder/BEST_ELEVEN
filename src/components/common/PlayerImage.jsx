import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

export default function PlayerImage({
  player,
  className = "",
  draggable = false,
}) {
  const [imageSrc, setImageSrc] = useState(player.image);
  const [isFallback, setIsFallback] = useState(false);
  const [hasImage, setHasImage] = useState(true);

  useEffect(() => {
    setImageSrc(player.image);
    setIsFallback(false);
    setHasImage(true);
  }, [player.pid, player.image, player.fallbackImage]);

  const handleImageError = () => {
    // 액션샷 실패 → 정면 이미지
    if (!isFallback && player.fallbackImage) {
      setImageSrc(player.fallbackImage);
      setIsFallback(true);
      return;
    }

    // 정면 이미지까지 실패
    setHasImage(false);
  };

  if (!hasImage) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-white/5 text-white/30 ${className}`}
      >
        <ImageOff size={18} strokeWidth={1.5} />

        <span className="text-[9px] whitespace-nowrap">이미지 없음</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={player.name}
      draggable={draggable}
      onError={handleImageError}
      className={className}
    />
  );
}
