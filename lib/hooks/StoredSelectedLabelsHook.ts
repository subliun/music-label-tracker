import { useEffect, useState } from "react";
import { useLocalStorage } from "./LocalStorageHook";

/**
 * React hook for the labels that the user has selected. Will not sync across components.
 * 
 * Abstraction over local storage that allows the use of arrays for tracking selected labels.
 **/
export function useStoredSelectedLabels() {
  const selectedLabelsKey = "selected-label-mbids";
  const [localStorage, setLocalStorage] = useLocalStorage(selectedLabelsKey, "");

  function storedToArray() {
    if (localStorage) {
      return JSON.parse(localStorage) as string[];
    } else {
      return [];
    }
  }

  console.log("initial state: " + storedToArray())
  
  const [value, setValue] = useState(storedToArray());

  useEffect(() => {
    setLocalStorage(JSON.stringify(value));
    console.log("updating local storage: " + JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;
}