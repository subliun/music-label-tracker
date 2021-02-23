import * as Db from "../db/Db";
import { MusicBrainzApi } from "../musicbrainz/MusicBrainzApi";
import ProfilePictureExtractor from "../ProfilePictureExtractor";
import { Label } from "../struct/Label";
import Puppeteer from "puppeteer";

import * as FileUtil from "../util/FileUtil";
import { MbEntityType } from "../struct/MbEntityType";
import { Release } from "../struct/Release";
import { MbEntity } from "../struct/MbEntity";
import { MusicBrainzDb } from "../db/MusicBrainzDb";
import { SpotifyServerApi } from "../spotify/SpotifyServerApi";

import * as DotEnvUtil from "../util/DotEnvUtil";
import { ExecTimer } from "../util/ExecTimer";

import { performance } from "perf_hooks";

/**
 * Search for music labels and releases.
 */
export class SearchEngine {
  private mbDb: MusicBrainzDb;

  private spotifyApi;

  isInitialized: boolean;

  constructor() {
    this.mbDb = new MusicBrainzDb();
    this.spotifyApi = new SpotifyServerApi();

    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    if (!this.spotifyApi.isAuthorized()) {
      DotEnvUtil.initEnvVars();

      let clientId = process.env.SPOTIFY_CLIENT_ID;
      let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error("ERROR: Spotify credentials not found.");
        console.error("Please provide a valid spotify client ID and client secret.");
        process.exit(1);
      }

      await this.spotifyApi.authorise(clientId, clientSecret);

      await this.mbDb.runTableMaintenance();
    }

    this.isInitialized = true;
  }

  /**
   * Search for a given record label.
   */
  async searchLabel(q: string, limit: number): Promise<Label[]> {
    let cleaned = q.trim().toLowerCase()
    return this.mbDb.searchLabel(cleaned, limit);
  }

  private cleanAlbumName(name: string) {
    function removeAfter(s: string, token: string) {
      let index = s.indexOf(token);
      if (index !== -1) {
        s = s.slice(0, index);
      }

      return s;
    }

    //remove brackets
    name = removeAfter(name, "(");

    //remove dash
    name = removeAfter(name, "-");

    name = name.trim();

    return name;
  }

  private isDuplicate(release: Release, releases: Release[]) {
    for (let current of releases) {
      if (release.mbid === current.mbid) {
        return true;
      }
    }

    return false;
  }

  /**
   * Try to lookup a release in the MusicBrainz database.
   */
  private async lookupRelease(
    albumName: string,
    artistName: string,
    year: number,
    fuzzy: boolean = false
  ): Promise<Release[]> {
    //so that we can do the two lookups simultaneously
    let result = this.mbDb.lookupRelease(albumName, artistName, year, fuzzy);

    return result;
  }

  private async searchReleaseDb(spotifyItems: any[], fuzzy: boolean = false) {
    let releases: Release[] = [];

    for (let albumInfo of spotifyItems) {
      let albumName = this.cleanAlbumName(albumInfo.name);
      let artistName = albumInfo.artists?.[0].name;

      let year: string = albumInfo.release_date;
      let dashIndex = year.indexOf("-");
      if (dashIndex !== -1) {
        year = year.slice(0, dashIndex);
      }

      let result = await this.lookupRelease(albumName, artistName, parseInt(year), fuzzy);

      //only use the first album returned by the db for now
      if (result.length > 0) {
        let release = result[0];
        release.photoUrl = albumInfo?.images?.[1]?.url;

        //don't enter duplicates
        if (!this.isDuplicate(release, releases)) {
          releases.push(release);
        }
      }
    }

    //remove items with the [no label] label
    let noLabelMbid = "157afde4-4bf5-4039-8ad2-5a15acc85176";
    releases = releases.filter(release => release.label.mbid !== noLabelMbid);

    return releases;
  }

  totalTime = 0;
  count = 0;

  /**
   * Search for a given release.
   */
  async searchRelease(q: string, limit: number): Promise<Release[]> {
    let execTimerSearch = new ExecTimer("search spotify");
    execTimerSearch.timeStart();
    let json = await this.spotifyApi.searchAlbum(q, limit);
    let t0 = performance.now();
    execTimerSearch.timeEnd();

    let execTimerDb = new ExecTimer("search db");
    execTimerDb.timeStart();
    let releases = await this.searchReleaseDb(json.albums.items);

    //try again with more expensive search
    if (releases.length === 0) {
      releases = await this.searchReleaseDb(json.albums.items, true);
      console.log("resorting to expensive search");
    } else {
      console.log("normal search is fine");
    }

    execTimerDb.timeEnd();
    let t1 = performance.now();
    this.count += 1;
    this.totalTime += t1 - t0;
    console.log("AVERAGE DB TIME IS: " + this.totalTime / this.count);

    return releases;
  }
}
