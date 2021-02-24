import React from "react";
import { Label } from "../../lib/struct/Label";
import PlaceholderImage from "../search/PlaceholderImage";
import animStyles from "./../Anim.module.css";
import styles from "./LabelStyles.module.css";

interface LabelCardImageProps {
  label: Label;
  className?: string;
}

export default function LabelCardImage(props: LabelCardImageProps) {
  return (
    <PlaceholderImage
      className={`${props.className} ${styles["label-card-main-image"]} w-14 h-14 sm:w-28 sm:h-28 sm:mt-4 flex-none overflow-hidden`}
      imageClassName={""}
      src={"/api/entity/" + props.label.mbid + "/image"}
      placeholderExtraClassName={animStyles.spin}
      placeholderSrc="vinyl_icon_simple.svg"
    ></PlaceholderImage>
  );
}
