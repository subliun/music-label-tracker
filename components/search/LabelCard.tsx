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
  let textSize = scaledTextSize(props.label.name);

  return (
    <div className={`overflow-hidden w-48 h-56 flex-none flex flex-col bg-white shadow rounded-xl`}>
      <PlaceholderImage
        className={`${styles["label-card-main-image"]} flex-none self-center overflow-hidden`}
        imageClassName={"border border-gray-200"}
        src={"/api/entity/" + props.label.mbid + "/image"}
        placeholderExtraClassName={animStyles.spin}
        placeholderSrc="vinyl_icon_simple.svg"
      ></PlaceholderImage>

      <div className={`${styles["main-text"]} h-full flex flex-col justify-center align-center`}>
        <p
          className={`px-6 py-2 overflow-hidden text-center ${textSize} tracking-wide leading-snug font-medium`}
        >
          {props.label.name}
        </p>
      </div>
    </div>
  );
}