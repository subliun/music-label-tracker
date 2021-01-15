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
  private mbApi: MusicBrainzApi;

  private readonly labelPhotoCachePath = "cache/label_photo_cache/";
  private readonly releaseGroupPhotoCachePath = "cache/release_group_photo_cache/";

  private readonly cacheDuration = 1000 * 60 * 60 * 24 * 7; // in milliseconds

  constructor() {
    this.mbApi = new MusicBrainzApi();
  }

  // Util method to check if the db's cached search results have expired
  private checkIfStale<T extends MbEntity>(cacheResults: Db.DbSearchResults<T>) {
    let stale = false;
    if (cacheResults) {
      let timeSinceLastCache = Date.now() - cacheResults.lastUpdated.getTime();
      stale = timeSinceLastCache > this.cacheDuration;
    }

    return stale;
  }

  /**
   * Checks to see if the cached search results should be refreshed from the network.
   */
  private isCacheInvalid<T extends MbEntity>(
    cacheResults: Db.DbSearchResults<T> | null,
    limit: number
  ): cacheResults is null {
    //Update the cache if the database has never seen this query before,
    //if the query is stale, or if the query does not have enough results
    return !cacheResults || this.checkIfStale(cacheResults) || cacheResults.entities.length < limit;
  }

  private async pullLabelsMusicBrainz(searchText: string, limit: number) {
    let entities = await this.mbApi.searchLabel(searchText, limit);

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

    if (this.isCacheInvalid(cacheResults, limit)) {
      return this.pullLabelsMusicBrainz(searchText, limit);
    } else {
      return cacheResults.entities;
    }
  }

  private async pullReleasesMusicBrainz(searchText: string, limit: number) {
    let entities = await this.mbApi.searchRelease(searchText, limit);

    console.log("Entities: " + entities);

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
    if (this.isCacheInvalid(cacheResults, limit)) {
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
    mbid: string,
    profileExtractor: ProfilePictureExtractor
  ): Promise<string | null> {
    let filePath = this.labelPhotoCachePath + mbid + ".jpg";
    let exists = await FileUtil.exists(filePath);

    if (exists) {
      return filePath;
    }

    let twitterUrls = await this.mbApi.getCertainUrls(mbid, "twitter.com");
    let discogsUrls = await this.mbApi.getCertainUrls(mbid, "discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let pictureUrl = await profileExtractor.extractTwitterPicture(twitterUrls[0]);

      if (pictureUrl) {
        //Cache picture
        await FileUtil.createFolder(process.cwd() + "/" + this.labelPhotoCachePath);
        await FileUtil.download(pictureUrl, filePath);

        return filePath;
      }
    }

    return null;
  }

  /**
   * Try to get the path of a photo for the release.
   * 
   * Uses the release's group mbid.
   * 
   * Will try to use the cached image first, then download an image from the mbid's entry on 
   * coverartarchive.org.
   */
  async getReleasePicturePath(release: Release): Promise<string | null> {
    let filePath = this.releaseGroupPhotoCachePath + release.releaseGroupMbid + ".jpg";
    let exists = await FileUtil.exists(filePath);

    if (exists) {
      return filePath;
    }

    let pictureUrl = await this.mbApi.getReleaseGroupPictureUrl(release.releaseGroupMbid);

    console.log("pciture url: " + pictureUrl);
    
    if (pictureUrl) {
      //Cache picture
      await FileUtil.createFolder(process.cwd() + "/" + this.releaseGroupPhotoCachePath);
      await FileUtil.download(pictureUrl, filePath);

      return filePath;
    }

    return null;
  }
}
