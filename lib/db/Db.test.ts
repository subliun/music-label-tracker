import { MusicBrainzEntityType } from "../musicbrainz/MusicBrainzEntityType";
import * as Db from "./Db";

test("The database is open", async () => {
  await Db.query("SELECT 1 + 1");
});

let searchText = "sub pop";

let mbids = [
  "38dc88de-7720-4100-9d5b-3cdc41b0c474",
  "819d1971-7ed7-4dff-9dbb-1dbcc5d1a2ac",
  "bebd05e6-5ea6-4789-8129-21ae3ab56822",
  "991715f3-99cb-46b6-b053-8bc5db9a69ef",
  "7ce1464e-4f4e-44fe-9f49-0b192ceb0069",
];

let emptyResultSearchText = "hi_this_is_empty";

test("Adding label search results works", async () => {
  await Db.updateSearchResults(searchText, mbids, MusicBrainzEntityType.LABEL);
});

test("Adding empty label search results works", async () => {
  await Db.updateSearchResults(emptyResultSearchText, [], MusicBrainzEntityType.LABEL);
})

test("Retrieving label search results works", async () => {
  let result = await Db.readSearchResults(searchText, 5);
  expect(result).toBeTruthy();
  expect(result?.mbids).toEqual(mbids);
});

test("Retrieving previously-unsearched query returns null", async () => {
  let result = await Db.readSearchResults("this_is_not_a_label_name", 5);
  expect(result).toBeNull();
});

test("Retrieving empty results gives correct update time", async () => {
  let result = await Db.readSearchResults(emptyResultSearchText, 5);
  expect(result).toBeTruthy();
  expect(result?.mbids).toEqual([]);
});

// you're my wonderwall
afterAll(async () => {
  await Db.close();
});
