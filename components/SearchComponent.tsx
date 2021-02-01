import result from "postcss/lib/result";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { start } from "repl";
import { Label } from "../lib/struct/Label";
import { MbEntityType } from "../lib/struct/MbEntityType";
import { Release } from "../lib/struct/Release";
import { SearchResultLabel } from "./SearchResultLabel";
import { SearchResultRelease } from "./SearchResultRelease";

export default function SearchComponent() {
  const [searchText, setSearchText] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const latestResultTimeRef = useRef<number>(0);

  async function onSearchPressed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    search();
  }

  async function search() {
    if (searchText.length === 0) {
      setReleases([]);
      return;
    }

    let searchTime = Date.now();

    let params = new URLSearchParams();
    params.append("q", searchText);

    let result = await fetch("/api/search" + "?" + params.toString(), {
      method: "GET",
    }).then((response) => response.json());

    //prevent old, slow requests from overwriting fresh ones
    if (searchTime > latestResultTimeRef.current) {
      setLabels(result.labels);
      setReleases(result.releases);
      latestResultTimeRef.current = searchTime;
    }
  }

  //Search but only after some delay.
  function searchDelayed() {
    const startSearchText = searchText;
    const delay = 200;
    let searchTimer = setTimeout(() => {
      search();
    }, delay);

    return searchTimer;
  }

  useEffect(() => {
    let timer = searchDelayed();

    //clear the timout when the searchText is changed.
    //this prevents the search from running if it hasn't been run already
    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  return (
    <div className="w-full px-14 max-w-3xl">
      <form method="GET" onSubmit={onSearchPressed}>
        <input
          type="text"
          className="w-full h-12 p-4 shadow-md"
          name="q"
          aria-label="Search"
          autoComplete={"off"}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          placeholder="Enter a label (e.g. Sub Pop) or release (e.g. Titanic Rising)"
        ></input>
      </form>

      <div className="pb-4 grid grid-cols-2 md:grid-cols-3 bg-white">
        {labels.map((label) => (
          <div className="flex justify-center">
            <SearchResultLabel key={label.mbid} label={label}></SearchResultLabel>
          </div>
        ))}
      </div>
      <div>
        {releases.map((release) => (
          <div></div> //<SearchResultRelease key={release.mbid} release={release}></SearchResultRelease>
        ))}
      </div>
    </div>
  );
}
