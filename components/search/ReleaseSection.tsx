import React, { useState } from "react";
import { MbEntityType } from "../../lib/struct/MbEntityType";
import { Release } from "../../lib/struct/Release";
import PlaceholderImage from "./PlaceholderImage";

interface ReleaseSectionProps {
  release: Release;
}

export function SearchResultRelease(props: ReleaseSectionProps) {
  let [isReleaseImageLoaded, setReleaseImageLoaded] = useState(false);

  let imageUrl = props.release.photoUrl;

  return (
    <div className="flex flex-row justify-between px-6 py-4 bg-white">
      <div className="flex flex-row items-center">
        <div className={"flex-none w-24 h-24"}>
          <img
            className={
              "w-full h-full rounded transition-opacity" +
              " " +
              (isReleaseImageLoaded ? "opacity-1" : "opacity-0")
            }
            src={imageUrl}
            onLoad={() => setReleaseImageLoaded(true)}
          ></img>
        </div>

        <div className="ml-4 flex flex-col">
          <p className="text-lg">{props.release.name}</p>
          <p className="mt-1 text-sm">{props.release.artistName}</p>
        </div>
      </div>
    </div>
  );
}
