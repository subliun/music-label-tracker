import fetch from "node-fetch";

import { Label } from "./struct/Label";
import { Release } from "./struct/Release";

import ProfilePictureExtractor from "./ProfilePictureExtractor";

class LabelSearchResult {
  constructor(readonly numResults: number, readonly offset: number, readonly labels: Label[]) {}
}

class ReleaseLookupResult {
  constructor(readonly numResults: number, readonly offset: number, readonly releases: Release[]) {}
}

/**
 * For making lookups to https://musicbrainz.org/
 */
class MusicBrainzApi {
  readonly baseUrl = "http://musicbrainz.org/ws/2/";

  /**
   * Generic method to look up any resource from MusicBrainz.
   *
   * @param resource The type of resource to look up .
   * @param id The id if we are looking up a specific resource. For search this should be empty.
   * @param params Params for the request. Modified by this method.
   */
  private musicBrainzRequest(resource: string, id: string, params: URLSearchParams) {
    //Use json by default
    params.append("fmt", "json");

    let queryString = this.baseUrl + resource + "/" + id + "?" + params.toString();

    return fetch(queryString, {
      method: "GET",
    }).then((response) => response.json());
  }

  async searchLabel(labelName: string): Promise<LabelSearchResult> {
    let params = new URLSearchParams();
    params.append("query", labelName);

    let json = await this.musicBrainzRequest("label", "", params);

    let labels = (json.labels as any[]).map((label) => {
      return { musicBrainzId: label.id, name: label.name };
    });

    let result = new LabelSearchResult(json["count"], json["offset"], labels);
    return result;
  }

  /**
   * Try to get the URL of a photo for the label associated with the provided label id.
   * Will try to use the twitter account image first, then the discogs image, then return null.
   */
  async getLabelPicture(labelMusicBrainzId: string, profileExtractor: ProfilePictureExtractor): Promise<string | null> {
    //http://musicbrainz.org/ws/2/label/38dc88de-7720-4100-9d5b-3cdc41b0c474?fmt=json&inc=url-rels
    let params = new URLSearchParams();
    params.append("inc", "url-rels");

    let json = await this.musicBrainzRequest("label", labelMusicBrainzId, params);

    //helper function to filter for given urls in the returned json
    let getCertainUrls = (include: string) => {
      return json.relations
        .map((relation: any) => {
          console.log(relation);
          return relation?.url?.resource;
        })
        .filter((urlString: string) => urlString) // check that the url is defined
        .filter((urlString: string) => {
          return urlString.includes(include);
        });
    };

    let twitterUrls = getCertainUrls("twitter.com");
    let discogsUrls = getCertainUrls("discogs.com");

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      return profileExtractor.extractTwitterPicture(twitterUrls[0]);
    } else {
      return null;
    }
  }

  async getLabelReleases(labelMusicBrainzId: string, offset: number = 0): Promise<ReleaseLookupResult> {
    let params = new URLSearchParams();
    params.append("label", labelMusicBrainzId);
    params.append("offset", offset.toString());

    let json = await this.musicBrainzRequest("release", "", params);

    let releases = (json.releases as any[]).map((release) => {
      return { musicBrainzId: release.id, name: release.title, date: release.date };
    });

    let result = new ReleaseLookupResult(json["release-count"], json["release-offset"], releases);
    return result;
  }
}

export { MusicBrainzApi, LabelSearchResult };
