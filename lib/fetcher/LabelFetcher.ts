import * as Db from "../db/Db";
import { MusicBrainzApi } from "../musicbrainz/MusicBrainzApi";
import ProfilePictureExtractor from "../ProfilePictureExtractor";
import { Label } from "../struct/Label";
import Puppeteer from "puppeteer";

import * as FileUtil from "../util/FileUtil";
import { MusicBrainzEntityType } from "../musicbrainz/MusicBrainzEntityType";

/**
 * Fetch info about music labels. Provides search functionality.
 * Will intelligently cache results and update the cache periodically.
 * Defers to MusicBrainzApi if the info is not already in the cache.
 */
export class LabelFetcher {
  private musicBrainzApi: MusicBrainzApi;
  private profileExtractor: ProfilePictureExtractor;

  private readonly photoCachePath = "cache/label_photo_cache/";

  private readonly cacheDuration = 1000 * 60 * 60 * 24 * 7; // in milliseconds

  constructor(profileExtractor: ProfilePictureExtractor) {
    this.musicBrainzApi = new MusicBrainzApi();
    this.profileExtractor = profileExtractor;
  }

  private async updateLabelCache(searchText: string, labels: Label[]) {
    //Store the label info
    for (let label of labels) {
      Db.insertLabel(label);
    }

    Db.updateSearchResults(
      searchText,
      labels.map((l) => l.mbid),
      MusicBrainzEntityType.LABEL
    );
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

  /**
   * Search for a matching label.
   *
   * @param searchText The search query text.
   */
  async searchLabel(searchText: string, limit: number): Promise<Label[]> {
    let cacheResults = await Db.readSearchResults(searchText, limit);

    //Update the cache if the database has never seen this query before
    //or if the query is stale
    if (!cacheResults || this.checkIfStale(cacheResults)) {
      let results = await this.musicBrainzApi.searchLabel(searchText, limit);

      this.updateLabelCache(searchText, results);

      return results;
    } else {
      //Read in the labels from the database
      let results = [];
      for (let mbid of cacheResults.mbids) {
        let label = await Db.readLabel(mbid);
        if (label) {
          results.push(label);
        }
      }

      return results;
    }
  }

  /**
   * Try to get the URL of a photo for the label associated with the provided label id.
   * Will try to use the twitter account image first, then the discogs image, then return null.
   */
  async getLabelPicture(labelMbid: string): Promise<string | null> {
    let twitterUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "twitter.com");
    let discogsUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let pictureUrl = await this.profileExtractor.extractTwitterPicture(twitterUrls[0]);

      if (pictureUrl) {
        //Cache picture
        let fileName = this.photoCachePath + labelMbid + ".jpg";
        FileUtil.download(pictureUrl, fileName);
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
