import React from "react";
import { useState } from "react";
import { useSelectedLabels } from "../../lib/hooks/SelectedLabelsHook";
import { Label } from "../../lib/struct/Label";
import { MAX_ADDABLE_MBIDS } from "../../lib/util/Constants";
import AddedLabelsComponent from "../added/AddedLabelsComponent";
import SearchComponent from "../search/SearchComponent";

export default function MainComponent() {
  const [selectedLabels, setSelectedLabels] = useSelectedLabels();

  console.log("main: " + selectedLabels)

  function onLabelAdded(label: Label) {
    console.log("on label added called")
    if (!selectedLabels.includes(label.mbid) && selectedLabels.length < MAX_ADDABLE_MBIDS) {
      setSelectedLabels([...selectedLabels, label.mbid]);
    }
  }

  return (
    <>
      <SearchComponent onLabelAdded={(label) => onLabelAdded(label)}></SearchComponent>
      <AddedLabelsComponent selectedLabelMbids={selectedLabels} setSelectedLabels={setSelectedLabels}></AddedLabelsComponent>
    </>
  );
}