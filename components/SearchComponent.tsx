import { FormEvent, useState } from "react";
import { Label } from "../lib/struct/Label";

export default function SearchComponent() {
  let [searchText, setSearchText] = useState("");
  let [image, setImage] = useState("");

  async function onSearchPressed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let params = new URLSearchParams();
    params.append("q", searchText);

    console.log("/api/search" + "?" + params.toString());

    let result = await fetch("/api/search" + "?" + params.toString(), {
      method: "GET",
    }).then((response) => response.json());

    let labels = result.results as Label[];
    
    console.log(labels);
  }

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
      <img src={image} alt="A picture" title="A picture again"></img>
    </div>
  );
}
