import React from "react";
import { Label } from "../../lib/struct/Label";
import PlaceholderImage from "../search/PlaceholderImage";
import LabelCardImage from "./LabelCardImage";
import styles from "./LabelStyles.module.css";

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
        className={`
        overflow-hidden 
        w-full h-18 sm:w-48 sm:h-56 sm:flex-none 
        flex flex-row sm:flex-col sm:items-center
        bg-white sm:shadow rounded-xl`}
      >

        <LabelCardImage label={props.label}></LabelCardImage>

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
              {
              //{props.label.releaseCount + " " + (props.label.releaseCount === 1 ? "release" : "releases")}
              }
              released <span className="font-normal">Titanic Rising</span>
            </p>
          </div>
        </div>
      </div>
  );
}
