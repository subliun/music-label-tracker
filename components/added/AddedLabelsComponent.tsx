import React, { useEffect, useState } from "react";
import { Label } from "../../lib/struct/Label";
import LabelCard from "../label/LabelCard";
import LabelCardSmall from "../label/LabelCardSmall";
import RemoveLabelCardOverlay from "../search/RemoveLabelCardOverlay";
import AddAnotherLabelButton from "./AddAnotherLabelButton";
import animStyles from "../Anim.module.css";

interface AddedLabelsComponentProps {
  selectedLabels: Label[];
  onLabelRemoved: (labelMbid: string) => void;
  onAddAnotherLabelClick: () => void;
}

const AddedLabelsComponent = React.forwardRef((props: AddedLabelsComponentProps, ref: any) => {
  const [disappearing, setDisappearing] = useState<Label[]>([]);

  function onRemoveLabelClick(e: React.MouseEvent, label: Label) {
    let delay = 200;

    setDisappearing([...disappearing, label])

    setTimeout(() => {
      props.onLabelRemoved(label.mbid);
      setDisappearing(disappearing.filter(d => d.mbid != label.mbid));
    }, delay);
  }

  return (
    <div className="w-full p-4 max-w-md sm:max-w-4xl flex flex-col items-start bg-gray-50">
      <h2 className="w-full text-xl ml-2 mb-4 text-gray-900 rounded-md">Labels</h2>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-6">
        {props.selectedLabels.map((label) => {
          let animationClass = animStyles["fade-in"];
          if (disappearing.map(l => l.mbid).includes(label.mbid)) {
            animationClass = animStyles["shrink"];
          }

          return (
            <div
              className={`${animationClass}`}
              key={label.mbid}
              div-mbid={label.mbid}
            >
              <RemoveLabelCardOverlay onRemoveLabelClick={(e) => onRemoveLabelClick(e, label)}>
                <LabelCardSmall label={label}></LabelCardSmall>
              </RemoveLabelCardOverlay>
            </div>
          );
        })}

        <AddAnotherLabelButton onClick={props.onAddAnotherLabelClick}></AddAnotherLabelButton>
      </div>
    </div>
  );
});

export default AddedLabelsComponent;
