import React from "react";
import { Label } from "../../lib/struct/Label";
import PlaceholderImage from "./PlaceholderImage";
import styles from "./LabelStyles.module.css";
import animStyles from "./Anim.module.css";

interface LabelCardProps {
  label: Label;
}

function scaledTextSize(text: string): string {
  let textSize = "text-3xl";

  let sizes = {
    8: "text-2xl",
    15: "text-xl",
    40: "text-md",
    60: "text-sm",
  };

  for (let [size, value] of Object.entries(sizes)) {
    if (text.length > parseInt(size)) {
      textSize = value;
    }
  }

  return textSize;
}

export default function LabelCard(props: LabelCardProps) {
  let textSizeBig = scaledTextSize(props.label.name);
  let textSizeSmall = "text-lg";

  return (
      <div
        className={`overflow-hidden w-full h-18 sm:w-48 sm:h-56 sm:flex-none flex flex-row sm:flex-col bg-white sm:shadow rounded-xl`}
      >
        <PlaceholderImage
          className={`${styles["label-card-main-image"]} w-14 h-14 sm:w-28 sm:h-28 sm:mt-4 flex-none self-center overflow-hidden`}
          imageClassName={"border border-gray-200"}
          src={"/api/entity/" + props.label.mbid + "/image"}
          placeholderExtraClassName={animStyles.spin}
          placeholderSrc="vinyl_icon_simple.svg"
        ></PlaceholderImage>

        <div
          className={`${styles["main-text"]} h-full flex flex-col justify-center align-center`}
        >
          <div className="px-4 sm:px-6 overflow-hidden text-left sm:text-center">
            <p
              className={`${textSizeSmall} sm:${textSizeBig} tracking-wide leading-tight sm:leading-snug font-medium`}
            >
              {props.label.name}
            </p>
            <p className="block sm:hidden font-light text-sm">
              {props.label.releaseCount} releases
            </p>
          </div>
        </div>
      </div>
  );
}
