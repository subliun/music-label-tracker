import * as Db from "../db/Db";
import { MusicBrainzApi } from "../musicbrainz/MusicBrainzApi";
import ProfilePictureExtractor from "../ProfilePictureExtractor";
import { Label } from "../struct/Label";
import Puppeteer from "puppeteer";

import * as FileUtil from "../util/FileUtil";
import { MbEntityType } from "../struct/MusicBrainzEntityType";
import { Release } from "../struct/Release";
import { MbEntity } from "../struct/MbEntity";

/**
 * Fetch info about music labels. Provides search functionality.
 * Will intelligently cache results and update the cache periodically.
 * Defers to MusicBrainzApi if the info is not already in the cache.
 */
export class LabelFetcher {
  private musicBrainzApi: MusicBrainzApi;

  private readonly photoCachePath = "cache/label_photo_cache/";

  private readonly cacheDuration = 1000 * 60 * 60 * 24 * 7; // in milliseconds

  constructor() {
    this.musicBrainzApi = new MusicBrainzApi();
  }

  // Util method to check if the db's cached search results have expired
  private checkIfStale(cacheResults: Db.DbSearchResults) {
    let stale = false;
    if (cacheResults) {
      let timeSinceLastCache = Date.now() - cacheResults.lastUpdated.getTime();
      stale = timeSinceLastCache > this.cacheDuration;
    }

    return stale;
  }

  private async pullLabelsMusicBrainz(searchText: string, limit: number) {
    let entities = await this.musicBrainzApi.searchLabel(searchText, limit);

    //Store the label info
    for (let label of entities) {
      Db.insertLabel(label);
    }

    Db.updateSearchResults(
      searchText,
      entities.map((l) => l.mbid),
      MbEntityType.LABEL
    );

    return entities;
  }

  /**
   * Search for a given record label.
   * 
   * Hits the cache first, then tries the MusicBrainz api.
   */
  async searchLabel(searchText: string, limit: number): Promise<Label[]> {
    let cacheResults = await Db.readSearchResults<Label>(searchText, limit, MbEntityType.LABEL);

    //Update the cache if the database has never seen this query before
    //or if the query is stale
    if (!cacheResults || this.checkIfStale(cacheResults)) {
      return this.pullLabelsMusicBrainz(searchText, limit);
    } else {
      return cacheResults.entities;
    }
  }

  private async pullReleasesMusicBrainz(searchText: string, limit: number) {
    let entities = await this.musicBrainzApi.searchRelease(searchText, limit);

    console.log(entities);

    //Store the release info
    for (let release of entities) {
      Db.insertRelease(release);
    }

    Db.updateSearchResults(
      searchText,
      entities.map((l) => l.mbid),
      MbEntityType.RELEASE
    );

    return entities;
  }

  /**
   * Search for a given release.
   *
   * Hits the cache first, then tries the MusicBrainz api.
   */
  async searchRelease(searchText: string, limit: number): Promise<Release[]> {
    let cacheResults = await Db.readSearchResults<Release>(searchText, limit, MbEntityType.RELEASE);

    //Update the cache if the database has never seen this query before
    //or if the query is stale
    if (!cacheResults || this.checkIfStale(cacheResults)) {
      return this.pullReleasesMusicBrainz(searchText, limit);
    } else {
      return cacheResults.entities;
    }
  }

  /**
   * Try to get the path of a photo for the label associated with the provided label id.
   *
   * Will try to use the cached image first, then download an image from the associated mbid's url links.
   */
  async getLabelPicturePath(
    labelMbid: string,
    profileExtractor: ProfilePictureExtractor
  ): Promise<string | null> {
    let filePath = this.photoCachePath + labelMbid + ".jpg";
    let exists = await FileUtil.exists(filePath);

    if (exists) {
      return filePath;
    }

    let twitterUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "twitter.com");
    let discogsUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let pictureUrl = await profileExtractor.extractTwitterPicture(twitterUrls[0]);

      if (pictureUrl) {
        //Cache picture
        await FileUtil.createFolder(process.cwd() + "/" + this.photoCachePath);
        await FileUtil.download(pictureUrl, filePath);

        return filePath;
      }
    }

    return null;
  }

  async getLabelInfo(mbid: string) {
    // let label = await this.musicBrainzApi.searchLabel(q, n);
    // if (label.labels.length > 0) {
    //   console.log(label.labels[0].name);
    //   let picture = await this.musicBrainzApi.getLabelPicture(label.labels[0].mbid, pictureExtractor);
    //   console.log("Found picture link: " + picture);
    // }
    // Db.readLabel(mbid);
  }
}
