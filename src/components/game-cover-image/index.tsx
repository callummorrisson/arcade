import { useEffect, useState } from "react";
import defaultImage from './no-cover.webp';

export interface GameCoverImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  gameFolder: string;
  coverExtension?: string;
}

export function GameCoverImage({
  gameFolder,
  coverExtension,
  ...imgProps
}: GameCoverImageProps) {
  const [cover, setCover] = useState<string>();

  useEffect(() => {
    const getCover = async () => {
      const image = await import(
        `@/games/${gameFolder}/cover${coverExtension}`
      );
      setCover(image.default.src);
    };

    if (coverExtension) {
      getCover();
    } else {
      setCover(undefined);
    }
  }, [gameFolder, coverExtension]);

  return <img src={cover || defaultImage.src} alt="cover" width={400} height={400} {...imgProps} />;
}
