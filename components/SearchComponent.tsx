import result from "postcss/lib/result";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { start } from "repl";
import { Label } from "../lib/struct/Label";
import { MbEntityType } from "../lib/struct/MbEntityType";
import { Release } from "../lib/struct/Release";
import SearchResult from "./SearchResult";

export default function SearchComponent() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Release[]>([]);
  const latestResultTimeRef = useRef<number>(0);

  async function onSearchPressed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    search();
  }

  async function search() {
    if (searchText.length === 0) {
      setResults([]);
      return;
    }

    let searchTime = Date.now();

    let params = new URLSearchParams();
    params.append("q", searchText);

    let result = await fetch("/api/search" + "?" + params.toString(), {
      method: "GET",
    }).then((response) => response.json());

    let releases = result.releases;

    //prevent old, slow requests from overwriting fresh ones
    if (searchTime > latestResultTimeRef.current) {
      setResults(releases);
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
    console.log("running effect");
    let timer = searchDelayed();

    //clear the timout when the searchText is changed.
    //this prevents the search from running if it hasn't been run already
    return () => { clearTimeout(timer); };
  }, [searchText]);

  return (
    <div className="w-1/3">
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
        ></input>
      </form>
      <div>
        {results.map((result) => (
          <SearchResult
            key={result.mbid}
            release={result}
          ></SearchResult>
        ))}
      </div>
    </div>
  );
}
