import { useEffect, useState } from "react";
import { isLocalStorageAvailable } from "../util/LocalStorage";

/**
 * A React hook for setting and getting local storage (see Storage API).
 *
 * The caller must check that local storage is available before using this hook,
 * or the state from the hook will silently not be persisted.
 *
 * @param key The key that will be used in storage.
 * @param defaultState The state to use for this if there is no existing value in storage.
 */
export function useLocalStorage(key: string, defaultState: string | null) {
  if (isLocalStorageAvailable()) {
    defaultState = window.localStorage.getItem(key);
  }

  const [value, setValue] = useState(defaultState);

  useEffect(() => {
    console.log("at least we got here")
    if (isLocalStorageAvailable() && value) {
      console.log("set item has actually been called " + value)
      window.localStorage.setItem(key, value);
    }
  }, [value]);

  return [value, setValue] as const;
}
