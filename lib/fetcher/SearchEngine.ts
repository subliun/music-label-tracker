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

/**
 * Search for music labels and releases.
 */
export class SearchEngine {
  private mbApi: MusicBrainzApi;
  private mbDb: MusicBrainzDb;

  private spotifyApi;

  isInitialized: boolean;

  private readonly labelImageCachePath = "cache/label_image_cache/";
  private readonly releaseGroupImageCachePath = "cache/release_group_image_cache/";

  private readonly cacheDuration = 1000 * 60 * 60 * 24 * 7; // in milliseconds

  constructor() {
    this.mbApi = new MusicBrainzApi();
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

      console.time("create meta");
      await this.mbDb.runTableMaintenance();
      console.timeEnd("create meta");
    }

    this.isInitialized = true;
  }

  /**
   * Search for a given record label.
   */
  async searchLabel(q: string, limit: number): Promise<Label[]> {
    return this.mbDb.searchLabel(q, 5);
  }

  private cleanAlbumName(name: string) {
    //remove brackets
    let bracketIndex = name.indexOf("(");
    if (bracketIndex !== -1) {
      name = name.slice(0, bracketIndex);
    }

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
   * Try to lookup a release in the database.
   * 
   * If it can't find the album using the exact album name, this method will clean 
   * the name and search again.
   */
  private async lookupRelease(albumName: string, artistName: string): Promise<Release[]> {
    let albumNameCleaned = this.cleanAlbumName(albumName);

    //so that we can do the two lookups simultaneously
    let simpleLookupPromise = this.mbDb.lookupRelease(albumName, artistName);

    let resultCleaned: Release[] = [];
    if (albumNameCleaned !== albumName) {
      resultCleaned = await this.mbDb.lookupRelease(albumNameCleaned, artistName);
    }

    let resultSimple = await simpleLookupPromise;

    let result = resultSimple;
    if (resultSimple.length === 0) {
      result = resultCleaned;
    }

    return result;
  }

  /**
   * Search for a given release.
   */
  async searchRelease(q: string, limit: number): Promise<Release[]> {
    console.time("search spotify");
    let json = await this.spotifyApi.searchAlbum(q, limit);
    console.timeEnd("search spotify");

    console.log(json.albums.items);

    let releases: Release[] = [];
    for (let albumInfo of json.albums.items) {
      let albumName = albumInfo.name;

      let artistName = albumInfo.artists?.[0].name;

      let result = await this.lookupRelease(albumName, artistName);

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

    return releases;
  }

  /**
   * Try to get the path of a photo for the label associated with the provided label id.
   *
   * Will try to use the cached image first, then download an image from the associated mbid's url links.
   */
  async loadLabelImage(
    mbid: string,
    profileExtractor: ProfilePictureExtractor
  ): Promise<string | null> {
    let filePath = this.labelImageCachePath + mbid + ".jpg";
    let exists = await FileUtil.exists(filePath);

    if (exists) {
      return filePath;
    }

    let twitterUrls = await this.mbApi.getCertainUrls(mbid, "twitter.com");
    let discogsUrls = await this.mbApi.getCertainUrls(mbid, "discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let imageUrl = await profileExtractor.extractTwitterProfilePicture(twitterUrls[0]);

      if (imageUrl) {
        //Cache image
        await FileUtil.createFolder(process.cwd() + "/" + this.labelImageCachePath);
        await FileUtil.download(imageUrl, filePath);

        return filePath;
      }
    }

    return null;
  }
}
