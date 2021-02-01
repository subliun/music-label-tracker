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
      className={`${styles["label-card"]} mt-4 flex flex-none flex-col`}
      onClick={() => props.onClick(props.label)}
    >
      <AddLabelCardOverlay>
        <LabelCard label={props.label}></LabelCard>
      </AddLabelCardOverlay>
    </button>
  );
}
