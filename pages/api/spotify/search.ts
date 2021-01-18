import { NextApiRequest, NextApiResponse } from "next";
import { MusicBrainzDb } from "../../../lib/db/MusicBrainzDb";
import { SpotifyServerApi } from "../../../lib/spotify/SpotifyServerApi";
import { Release } from "../../../lib/struct/Release";
import * as FileUtil from "../../../lib/util/FileUtil";

let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

let api = new SpotifyServerApi();

let musicBrainzDb = new MusicBrainzDb();

let words: string[] | null;
async function stressTestSearch(n: number, delay: number) {
  if (!words) {
    words = (await FileUtil.readFile("/usr/share/dict/words")).split("\n");
  }

  for (let i = 0; i < n; i++) {
    let word = words[Math.floor(Math.random() * (words.length - 1))];
    console.log(word);

    setTimeout(async () => {
      let name = await api.searchAlbum(word);
      console.log(name?.albums?.items?.[0]?.name);
    }, delay * Math.random());
  }
}

function cleanAlbumName(name: string) {
  //remove brackets
  let bracketIndex = name.indexOf("(");
  if (bracketIndex !== -1) {
    name = name.slice(0, bracketIndex);
  }

  name = name.trim();

  return name;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!api.isAuthorized()) {
    if (!clientId || !clientSecret) {
      console.error("ERROR: Spotify credentials not found.");
      console.error("Please provide a valid spotify client ID and client secret.");
      process.exit(1);
    }

    await api.authorise(clientId, clientSecret);

    console.time("create meta");
    await musicBrainzDb.runTableMaintenance();
    console.timeEnd("create meta");
  }


  console.time("search spotify");
  let q = req.query.q as string;
  let json = await api.searchAlbum(q, 3);
  console.timeEnd("search spotify");

  // let albumInfo = await api.getMultipleAlbums(json.albums.items.map((a: any) => a.id));

  let searchAlbumInfo = json.albums.items?.[0];

  let albumName = searchAlbumInfo.name;
  let albumNameCleaned = cleanAlbumName(albumName);

  let artistName = searchAlbumInfo.artists?.[0].name;

  console.log("album name: " + albumName + " artist name: " + artistName);

  console.time("db lookup");

  //so that we can do the two lookups simultaneously 
  let simpleLookupPromise = musicBrainzDb.lookupRelease(albumName, artistName);
  let cleanedLookupPromise: Promise<any[]> | null = null;
  if (albumNameCleaned !== albumName) {
    cleanedLookupPromise = musicBrainzDb.lookupRelease(albumNameCleaned, artistName);
  }

  let mbResultSimple = await simpleLookupPromise;
  let mbResultCleaned = []; 
  if (cleanedLookupPromise) {
    mbResultCleaned = await cleanedLookupPromise;
  }

  let mbResult = mbResultSimple;
  if (mbResultSimple.length === 0) {
    mbResult = mbResultCleaned;
  }

  console.timeEnd("db lookup");

  console.time("label lookup");
  let labelResult = await musicBrainzDb.searchLabel(q, 5);
  console.log(labelResult);

  console.timeEnd("label lookup");

  let releases: Release[] = [];
  for (let temp of mbResult) {
    console.log(temp);
  }

  res.status(200).send(json);
};
