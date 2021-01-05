import * as Db from "../db/Db";
import { MusicBrainzApi } from "../MusicBrainzApi";
import ProfilePictureExtractor from "../ProfilePictureExtractor";
import { Label } from "../struct/Label";
import Puppeteer from "puppeteer";

import * as FileUtil from "../util/FileUtil";

/**
 * Fetch info about music labels. Provides search functionality.
 * Will intelligently cache results and update the cache periodically.
 * Defers to MusicBrainzApi if the info is not already in the cache.
 */
class LabelFetcher {
  private musicBrainzApi: MusicBrainzApi;
  private profileExtractor: ProfilePictureExtractor;
  
  private readonly photoCachePath = "cache/label_photo_cache/";

  constructor(browserInstance: Puppeteer.Browser) {
    this.musicBrainzApi = new MusicBrainzApi();
    this.profileExtractor = new ProfilePictureExtractor(browserInstance);
  }

  /**
   * Search the MusicBrainz database for a matching label.
   * 
   * @param searchText The search query text.
   */
  async searchLabel(searchText: string, limit: number) {
    let cacheResults = await Db.readSearchResults(searchText, limit);

    //Update the cache if the database has never seen this query before
    if (cacheResults.rowCount == 0) {
      let results = await this.musicBrainzApi.searchLabel(searchText, limit);
    }
  }

  /**
   * Try to get the URL of a photo for the label associated with the provided label id.
   * Will try to use the twitter account image first, then the discogs image, then return null.
   */
  async getLabelPicture(labelMbid: string, profileExtractor: ProfilePictureExtractor): Promise<string | null> {
    let twitterUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "twitter.com");
    let discogsUrls = await this.musicBrainzApi.getCertainUrls(labelMbid, "discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let pictureUrl = await profileExtractor.extractTwitterPicture(twitterUrls[0]);

      if (pictureUrl) {
        //Cache picture
        let fileName = this.photoCachePath + labelMbid + ".jpg";
        FileUtil.download(pictureUrl, fileName);
      }
    }

    return null;
  }

  async getLabelInfo(mbid: string) {
    let label = await this.musicBrainzApi.searchLabel(q, n);
    if (label.labels.length > 0) {
      console.log(label.labels[0].name);
  
      let picture = await this.musicBrainzApi.getLabelPicture(label.labels[0].mbid, pictureExtractor);
      console.log("Found picture link: " + picture);
    }

    Db.readLabel(mbid);
  }
}