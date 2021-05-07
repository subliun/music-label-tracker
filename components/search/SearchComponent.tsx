import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Label } from "../../lib/struct/Label";
import { Release } from "../../lib/struct/Release";
import ClearInputButton from "./ClearInputButton";
import NoSearchResults from "./NoSearchResults";
import { SearchResult } from "./SearchResult";
import { SearchResultData } from "./SearchResultData";
import SearchResultsSection from "./SearchResultsSection";

interface SearchComponentProps {
  onLabelAdded: (label: Label) => void;
}

const SearchComponent = React.forwardRef((props: SearchComponentProps, ref: any) => {
  const [searchText, setSearchText] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  const latestResultTimeRef = useRef<number>(0);
  const [loading, setLoading] = useState(false);

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
    props.onLabelAdded(label);
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

  let results = compileResults();

  return (
    <div className="w-full max-w-md sm:max-w-3xl shadow-md bg-white border-t border-l border-r border-transparent focus-within:border-gray-200">
      <form method="GET" onSubmit={onSearchPressed}>
        <div className={`relative w-full h-12 z-10 flex justify-between rounded-sm`}>
          <input
            ref={ref}
            type="search"
            className="w-full p-4 appearance-none text-lg "
            name="q"
            aria-label="Search"
            autoComplete={"off"}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            placeholder="Enter a label (e.g. Sub Pop) or release (e.g. Titanic Rising)"
          ></input>
          {searchText.length > 0 && <ClearInputButton
            className="w-8 h-8 mr-2 self-center"
            onClick={() => setSearchText("")}
          ></ClearInputButton> }
        </div>

        <hr></hr>
      </form>
      
      <SearchResultsSection
        results={results}
        loading={loading}
        onLabelAdded={onLabelAdded}
        searchText={searchText}
      ></SearchResultsSection>
    </div>
  );
});

export default SearchComponent;
