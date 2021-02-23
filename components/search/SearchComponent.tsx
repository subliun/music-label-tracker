import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useSelectedLabels } from "../../lib/hooks/SelectedLabelsHook";
import { Label } from "../../lib/struct/Label";
import { Release } from "../../lib/struct/Release";
import NoSearchResults from "./NoSearchResults";
import { SearchResult } from "./SearchResult";
import { SearchResultData } from "./SearchResultData";
import SearchResultsSection from "./SearchResultsSection";

export default function SearchComponent() {
  const [searchText, setSearchText] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  
  const latestResultTimeRef = useRef<number>(0);
  const [loading, setLoading] = useState(false);
  
  const [selectedLabels, setSelectedLabels] = useSelectedLabels();

  async function onSearchPressed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    search();
  }

  async function search() {
    if (searchText.length === 0) {
      setLabels([]);
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
      setLoading(false);
      latestResultTimeRef.current = searchTime;
    }
  }

  //Search but only after some delay.
  function searchDelayed() {
    setLoading(true);

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

  function onLabelAdded(label: Label) {
    if (!selectedLabels.includes(label.mbid)) {
      let newList = selectedLabels;
      newList.push(label.mbid);
      setSelectedLabels(newList);
    }

    console.log(selectedLabels);
  }

  function compileResults() {
    let results: SearchResultData[] = [];
    for (let label of labels) {
      results.push({ label: label, release: undefined });
    }

    for (let release of releases) {
      let seen = results.map((r) => r.label.mbid).includes(release.label.mbid);
      if (!seen) {
        results.push({ label: release.label, release: release });
      }
    }

    return results;
  }

  return (
    <div className="w-full px-6 max-w-md sm:max-w-3xl">
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

      <SearchResultsSection results={compileResults()} loading={loading} onLabelAdded={onLabelAdded} searchText={searchText}></SearchResultsSection>
    </div>
  );
}
