import { MbEntityType } from "../struct/MusicBrainzEntityType";
import { Label } from "../struct/Label";
import { Release } from "../struct/Release";
import * as Db from "./Db";

import { DateTime } from "luxon";

test("The database is open", async () => {
  await Db.query("SELECT 1 + 1");
});

let testLabel: Label = {mbid: "38dc88de-7720-4100-9d5b-3cdc41b0c474", name: "Sub Pop" };
let testRelease: Release = {
  mbid: "38c7af19-3f10-46f7-8a85-3c9801893593", 
  name: "Titanic Rising", 
  date: DateTime.fromISO("2019-04-05"), 
  labels: [testLabel]
};

let searchText = "sub pop";

let mbids = [
  "38dc88de-7720-4100-9d5b-3cdc41b0c474",
].sort();

let emptyResultSearchText = "hi_this_is_empty";

// beforeAll(async () => {
//   await Db.resetDb();
// });

describe("Labels", () => {
  test("can be added", async () => {
    await Db.insertLabel(testLabel);
  });

  test("can be read", async () => {
    let label = await Db.readLabel(testLabel.mbid);
    expect(label).toEqual(testLabel);
  });
});

describe("Releases", () => {
  test("can be added", async () => {
    await Db.insertRelease(testRelease);
  });

  test("can be read", async () => {
    let release = await Db.readRelease(testRelease.mbid);
    expect(release).toEqual(testRelease);
  });
});

test("Adding label search results works", async () => {
  await Db.updateSearchResults(searchText, mbids, MbEntityType.LABEL);
});

test("Adding empty label search results works", async () => {
  await Db.updateSearchResults(emptyResultSearchText, [], MbEntityType.LABEL);
})

test("Retrieving label search results works", async () => {
  let result = await Db.readSearchResults(searchText, mbids.length, MbEntityType.LABEL);
  expect(result).toBeTruthy();
  expect(result?.entities).toHaveLength(mbids.length);
  expect(result?.entities?.sort()?.map((e) => e.mbid)).toEqual(mbids);
});

test("Retrieving previously-unsearched query returns null", async () => {
  let result = await Db.readSearchResults("this_is_not_a_label_name", 5, MbEntityType.LABEL);
  expect(result).toBeNull();
});

test("Retrieving empty results works", async () => {
  let result = await Db.readSearchResults(emptyResultSearchText, 5, MbEntityType.LABEL);
  expect(result).toBeTruthy();
  expect(result?.entities).toEqual([]);
});

// you're my wonderwall
afterAll(async () => {
  await Db.close();
});
