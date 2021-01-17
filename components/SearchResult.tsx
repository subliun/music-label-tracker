import { useState } from "react";
import { MbEntityType } from "../lib/struct/MbEntityType";

interface SearchResultProps {
  mbid: string;
  name: string;
  artist: string;
  entityType: MbEntityType;
  releaseGroup: string;
  coverUrl: string;
}

export default function SearchResult(props: SearchResultProps) {
  let [isImageLoaded, setImageLoaded] = useState(false);

  let imageUrl = props.coverUrl; //`http://coverartarchive.org/release-group/${props.releaseGroup}/front-250`;

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
        <p className="text-lg">{props.name}</p>
        <p className="mt-1 text-sm">{props.artist}</p>
      </div>

      <p className="ml-4">{props.releaseGroup}</p>
    </div>
  );
}
