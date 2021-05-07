import React from "react";
import { Label } from "../../lib/struct/Label";
import { TextUtil } from "../../lib/util/TextUtil";
import PlaceholderImage from "../search/PlaceholderImage";
import LabelCardImage from "./LabelCardImage";
import LabelReleaseCount from "./LabelReleaseCount";
import styles from "./LabelStyles.module.css";

interface LabelCardProps {
  label: Label;
}

function scaledTextSize(text: string): string {
  let textSize = "text-3xl";

  let sizes = {
    8: "text-2xl",
    12: "text-xl",
    20: "text-md",
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
  console.log("namaemem: " + props.label.name);
  let textSizeBig = scaledTextSize(props.label.name);
  let maxNameLength = 40;

  return (
      <div
        className={`
        overflow-hidden 
        w-48 h-56 flex-none 
        flex flex-col items-center
        bg-white group-focus:bg-gray-50 border-2 border-transparent group-focus:border-gray-200 shadow rounded-xl`}
      >

        <LabelCardImage label={props.label} className="w-14 h-14 sm:w-28 sm:h-28 sm:mt-4"></LabelCardImage>

        <div
          className={`${styles["main-text"]} h-full flex flex-col justify-start items-center`}
        >
          <div className="h-16 px-6 flex flex-col justify-center overflow-hidden text-center">
            <p
              className={`${textSizeBig} tracking-wide leading-tight font-medium`}
            >
              {TextUtil.ellipsize(props.label.name, maxNameLength)}
            </p>
          </div>
          <LabelReleaseCount releaseCount={props.label.releaseCount}></LabelReleaseCount>
        </div>
      </div>
  );
}
