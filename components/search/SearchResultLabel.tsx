import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Label } from "../../lib/struct/Label";
import AddLabelCardOverlay from "./AddLabelCardOverlay";
import LabelCard from "./LabelCard";
import styles from "./LabelStyles.module.css";

interface SearchResultProps {
  label: Label;
  onClick: (label: Label) => void;
}

export function SearchResultLabel(props: SearchResultProps) {
  return (
    <button
      className={`${styles["label-card"]} w-full sm:w-auto flex flex-col`}
      onClick={() => props.onClick(props.label)}
    >
      <div className="hidden sm:block">
        <AddLabelCardOverlay>
          <LabelCard label={props.label}></LabelCard>
        </AddLabelCardOverlay>
      </div>

      <div className="flex sm:hidden flex-row justify-between">
        <LabelCard label={props.label}></LabelCard>
        <div className="sm:hidden w-8 h-8 flex-none self-center flex justify-center align-center rounded-sm bg-blue-500 hover:bg-blue-600 shadow">
          <svg
            className=""
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
        </div>
      </div>
    </button>
  );
}
