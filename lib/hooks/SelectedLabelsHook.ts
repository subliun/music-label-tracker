import { useEffect, useState } from "react";
import { useLocalStorage } from "./LocalStorageHook";

//Abstraction over local storage that allows the use of arrays
export function useSelectedLabels() {
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