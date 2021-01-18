import { useState } from "react";
import { MbEntityType } from "../lib/struct/MbEntityType";
import { Release } from "../lib/struct/Release";

interface SearchResultProps {
  release: Release;
}

export default function SearchResult(props: SearchResultProps) {
  let [isImageLoaded, setImageLoaded] = useState(false);

  let imageUrl = props.release.photoUrl;

  return (
    <div className="flex flex-row items-center px-6 py-4 bg-white hover:bg-indigo-300">
      <div className={"flex-none w-24 h-24"}>
        <img
          className={
            "w-full h-full rounded transition-opacity" +
            " " +
            (isImageLoaded ? "opacity-1" : "opacity-0")
          }
          src={imageUrl}
          onLoad={() => setImageLoaded(true)}
        ></img>
      </div>

      <div className="ml-4 flex flex-col">
        <p className="text-lg">{props.release.name}</p>
        <p className="mt-1 text-sm">{props.release.artistName}</p>
      </div>

      <div className="ml-4 flex flex-col">
        <p>{props.release.mbid}</p>
        <p className="mt-1">{props.release.label.name + ` (${props.release.label.releaseCount})`}</p>
      </div>
    </div>
  );
}
