import { useState } from "react";

interface PlaceholderImageProps {
  className: string;
  imageClassName: string;
  src: string;
  placeholderExtraClassName?: string;
  placeholderSrc: string;

  onError?: () => void
  onLoaded?: () => void
}

export default function PlaceholderImage(props: PlaceholderImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={props.className + " relative"}>
      <img
        className={[
          "w-full h-full",
          props.imageClassName,
          "absolute transition-opacity duration-1000",
          loaded ? "opacity-1" : "opacity-0",
        ].join(" ")}
        src={props.src}
        onError={() => {
          setLoaded(false);
          if(props.onError) props.onError();
        }}
        onLoad={() => {
          setLoaded(true);
          if(props.onLoaded) props.onLoaded();
        }}
      ></img>

      <img
        className={[
          "w-full h-full",
          props.imageClassName,
          props.placeholderExtraClassName,
          "absolute transition-opacity duration-300",
          !loaded ? "opacity-1" : "opacity-0",
        ].join(" ")}
        src={props.placeholderSrc}
      ></img>
    </div>
  );
}
