import React, { useState } from "react";
import { Label } from "../../lib/struct/Label";
import { Release } from "../../lib/struct/Release";
import { TextUtil } from "../../lib/util/TextUtil";
import LabelCardImage from "../label/LabelCardImage";
import styles from "./../label/LabelStyles.module.css";
import PlaceholderImage from "./PlaceholderImage";

interface ResultContentSmallProps {
  label: Label;
  release?: Release;
}

export default function ResultContentSmall(props: ResultContentSmallProps) {
  let [releaseImageSize, setReleaseImageSize] = useState("w-8 h-8")

  let textSizeSmall = "text-xl";
  let maxNameLength = 30;
  
  function SubText() {
    if (props.release) {
      let displayYear = "";
      if (props.release.dateYear) {
        displayYear = "(" + props.release.dateYear + ")";
      }

      return (
        <div className="flex flex-row space-x-1">
          <span className="font-light text-base">
            {props.release.name} {displayYear}
          </span>
        </div>
      );
    }

    return (
      <span>
        {props.label.releaseCount + " " + (props.label.releaseCount === 1 ? "release" : "releases")}
      </span>
    );
  }

  console.log(props.release?.photoUrl);

  return (
    <div
      className={`
      relative h-22
        flex flex-row`}
    >
      <LabelCardImage className="flex-none self-start" label={props.label}></LabelCardImage>

      {props.release && <div className="absolute z-10 left-8 top-9">
        <PlaceholderImage
          className={`flex-none ${releaseImageSize}`}
          imageClassName={"rounded-md"}
          src={props.release?.photoUrl as string}
          placeholderSrc="vinyl_icon_simple.svg"
        ></PlaceholderImage>
      </div>}
      
      {props.release && 
        <div className="h-22 mb-10"></div>
      }

      <div
        className={`${styles["main-text"]} h-full flex flex-col justify-start align-center`}
      >
        <div className="px-5 overflow-hidden text-left">
          <p className={`${textSizeSmall} tracking-wide leading-tight font-medium`}>
            {TextUtil.ellipsize(props.label.name, maxNameLength)}
          </p>
          <p className="block font-light mt-0.5">
            <SubText></SubText>
          </p>
        </div>
      </div>
    </div>
  );
}
