import React from "react";
import { Label } from "../../lib/struct/Label";
import NoSearchResults from "./NoSearchResults";
import { SearchResult } from "./SearchResult";
import { SearchResultData } from "./SearchResultData";

interface SearchResultsSectionProps {
  results: SearchResultData[];
  loading: boolean;

  searchText: string;

  onLabelAdded: (l: Label) => void;
}

export default function SearchResultsSection(props: SearchResultsSectionProps) {
  let results = props.results;

  if (results.length != 0) {
    return (
      <div className="p-4 bg-white">
        <div className="space-y-7 sm:space-y-0 my-4 flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3">
          {results.map((result) => (
            <div key={result.label.mbid + result?.release?.mbid} className="flex sm:justify-center">
              <SearchResult
                label={result.label}
                release={result.release}
                onClick={(l) => props.onLabelAdded(l)}
              ></SearchResult>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (!props.loading) {
    return (
      <div className="px-4 py-6 bg-white flex justify-center">
        <NoSearchResults q={props.searchText}></NoSearchResults>
      </div>
    );
  }

  return null;
}
