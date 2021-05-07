import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Label } from "../../lib/struct/Label";
import AddLabelCardOverlay from "./AddLabelCardOverlay";
import LabelCard from "../label/LabelCard";
import styles from "./../label/LabelStyles.module.css";
import { Release } from "../../lib/struct/Release";
import ResultContentSmall from "./ResultContentSmall";

interface SearchResultProps {
  label: Label;
  release?: Release;
  onClick: (label: Label) => void;
}

export function SearchResult(props: SearchResultProps) {
  return (
    <button
      className={`${styles["label-card"]} w-full sm:w-auto flex flex-col group`}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.blur();
        props.onClick(props.label);
      }}
    >
      <div className="hidden sm:block mb-6">
        <AddLabelCardOverlay>
          <LabelCard label={props.label}></LabelCard>
        </AddLabelCardOverlay>
      </div>

      <div className="w-full flex sm:hidden flex-row justify-between">
        <ResultContentSmall label={props.label} release={props.release}></ResultContentSmall>

        <button
          className={`
          sm:hidden 
          w-10 h-10 flex-none self-center 
          flex justify-center align-center 
          rounded-sm bg-blue-500 hover:bg-blue-600 shadow`}
        >
          <svg
            className="absolute w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </button>
  );
}
