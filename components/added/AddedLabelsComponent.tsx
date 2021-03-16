import React, { useEffect, useState } from "react";
import { useSelectedLabels } from "../../lib/hooks/SelectedLabelsHook";
import { Label } from "../../lib/struct/Label";
import LabelCard from "../label/LabelCard";

interface AddedLabelsComponentProps {
  selectedLabelMbids: string[];
  onLabelRemoved: (labelMbid: string) => void;
}

export default function AddedLabelsComponent(props: AddedLabelsComponentProps) {
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);

  console.log("add labels component sees selected labels: " + props.selectedLabelMbids);

  useEffect(() => {
    let oldMbidSet = new Set(selectedLabels.map((l) => l.mbid));

    let unknownLabelMbids = props.selectedLabelMbids.filter((mbid) => !oldMbidSet.has(mbid));
    if (unknownLabelMbids.length > 0) {
      fetch("/api/info?mbids=" + unknownLabelMbids.join(","))
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setSelectedLabels([...selectedLabels, ...data.labels]);
        });
    }
  });

  return (
    <div className="w-full p-4 max-w-md sm:max-w-3xl flex flex-col items-start bg-gray-100">
      <h2 className="w-full text-xl ml-2 text-gray-900 rounded-md">Labels</h2>
      <div className="flex flex-row flex-wrap">
        {selectedLabels.map((label) => (
          <div
            className="ml-4 mt-4"
            key={label.mbid}
            onClick={() => props.onLabelRemoved(label.mbid)}
          >
            <LabelCard label={label}></LabelCard>
          </div>
        ))}

        <div
          className={`
          ml-4 mt-4
        overflow-hidden 
        w-40 h-40 flex-none 
        flex flex-col items-center justify-center
        bg-gray-200 shadow rounded-xl`}
        >
          <div className="w-32 -mt-2 bg-none bg-opacity-90 hover:bg-opacity-80 text-gray-400">
            <svg
              className="w-20 h-20 opacity-90"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-gray-800 -mt-2 p-6 opacity-80 text-center tracking-wide font-light">
              Add Another Label
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
