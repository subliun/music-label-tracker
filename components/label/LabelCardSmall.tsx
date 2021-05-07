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

export default function LabelCard(props: LabelCardProps) {
  console.log("namaemem: " + props.label.name);
  let maxNameLength = 18;

  return (
    <div
      className={`
        h-24 flex-1
        flex flex-row items-center
        bg-white shadow rounded-xl overflow-hidden`}
    >
      <LabelCardImage label={props.label} className="w-14 h-14 ml-2 sm:ml-4"></LabelCardImage>

      <div className={`${styles["main-text"]} min-w-0 p-2 sm:px-3 flex flex-col items-start break-words `}>
        <p className={`min-w-0 w-full text-sm sm:text-md tracking-wide leading-tight font-medium `}>
          {TextUtil.ellipsize(props.label.name, maxNameLength)}
        </p>
        <LabelReleaseCount fontSizeClass={"text-xs"} releaseCount={props.label.releaseCount}></LabelReleaseCount>
      </div>
    </div>
  );
}
