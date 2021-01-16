import { useState } from "react";
import { MbEntityType } from "../lib/struct/MbEntityType";

interface SearchResultProps {
  mbid: string;
  name: string;
  artist: string;
  entityType: MbEntityType;
  releaseGroup: string;
}

export default function SearchResult(props: SearchResultProps) {
  let [isImageLoaded, setImageLoaded] = useState(false);

  let imageUrl = `http://coverartarchive.org/release-group/${props.releaseGroup}/front-250`;

  return (
    <div className="flex flex-row items-center px-6 py-4 bg-white hover:bg-indigo-300">
      <img
        className={"w-auto h-24 rounded" + " " + (isImageLoaded ? "" : "hidden")}
        src={imageUrl}
        alt="Error"
        onLoad={() => setImageLoaded(true)}
      ></img>

      <img
        className={"w-auto h-24" + " " + (isImageLoaded ? "hidden" : "")}
        src="vinyl_icon_simple.svg"
        alt="Error"
      ></img>

      <div className="ml-4 flex flex-col">
        <p className="text-lg">{props.name}</p>
        <p className="mt-1 text-sm">{props.artist}</p>
      </div>

      <p className="ml-4">{props.releaseGroup}</p>
    </div>
  );
}
