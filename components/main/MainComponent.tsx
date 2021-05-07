import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useStoredSelectedLabels } from "../../lib/hooks/StoredSelectedLabelsHook";
import { Label } from "../../lib/struct/Label";
import { MAX_ADDABLE_MBIDS } from "../../lib/util/Constants";
import AddedLabelsComponent from "../added/AddedLabelsComponent";
import SearchComponent from "../search/SearchComponent";
import animStyles from "../Anim.module.css";

export default function MainComponent() {
  const [storedSelectedLabels, setStoredSelectedLabels] = useStoredSelectedLabels();
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);

  // used to trigger a wiggle animation on adding a duplicate label
  const [addedDuplicateLabel, setAddedDuplicateLabel] = useState<Label | undefined>(undefined);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const addedLabelsGridRef = useRef<HTMLDivElement>(null);

  console.log("main: " + storedSelectedLabels);

  function loadStoredLabels() {
    let oldMbidSet = new Set(selectedLabels.map((l) => l.mbid));

    //if a label is stored add it to our list of known labels and fetch the associated info
    let unknownLabelMbids = storedSelectedLabels.filter((mbid) => !oldMbidSet.has(mbid));
    if (unknownLabelMbids.length > 0) {
      fetch("/api/info?mbids=" + unknownLabelMbids.join(","))
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setSelectedLabels([...selectedLabels, ...data.labels]);
        });
    }
  }

  useEffect(() => {
    loadStoredLabels();
  }, []);

  function onDuplicateLabelAdded(label: Label) {
    //this is a horrible hack to animate the child labels
    let children = addedLabelsGridRef?.current?.children;
    if (children) {
      let targetElem = Array.from(children).filter((c) => c.getAttribute("div-mbid") == label.mbid)?.[0];

      if (targetElem) {
        targetElem.classList.remove(animStyles["fade-in"]);
        targetElem.classList.remove(animStyles["wiggle"]);
        void (targetElem as any).offsetWidth;
        targetElem.classList.add(animStyles["wiggle"]);
      }
    }
  }

  function onLabelAdded(label: Label) {
    console.log("on label added called");
    if (
      !storedSelectedLabels.includes(label.mbid) &&
      storedSelectedLabels.length < MAX_ADDABLE_MBIDS
    ) {
      setSelectedLabels([...selectedLabels, label]);
      setStoredSelectedLabels([...storedSelectedLabels, label.mbid]);
    } else {
      onDuplicateLabelAdded(label);
    }
  }

  function onLabelRemoved(labelMbid: string) {
    let newSelectedLabels = selectedLabels.filter((l) => l.mbid !== labelMbid);

    setSelectedLabels([...newSelectedLabels]);
    setStoredSelectedLabels(newSelectedLabels.map((l) => l.mbid));
  }

  function onAddAnotherLabelClick() {
    // Apparently select() doesn't work on iOS
    searchInputRef.current?.focus();

    let length = searchInputRef?.current?.value?.length;
    searchInputRef.current?.setSelectionRange(0, length ?? 0);

    console.log("maknig a selecetion " + length);
  }

  return (
    <>
      <SearchComponent
        ref={searchInputRef}
        onLabelAdded={(label: Label) => onLabelAdded(label)}
      ></SearchComponent>

      <AddedLabelsComponent
        ref={addedLabelsGridRef}
        selectedLabels={selectedLabels}
        onLabelRemoved={onLabelRemoved}
        onAddAnotherLabelClick={onAddAnotherLabelClick}
      ></AddedLabelsComponent>
    </>
  );
}
