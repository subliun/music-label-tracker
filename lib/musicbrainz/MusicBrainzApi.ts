import fetch from "node-fetch";

import { Label } from "../struct/Label";
import { Release } from "../struct/Release";

class ReleaseLookupResult {
  constructor(readonly numResults: number, readonly offset: number, readonly releases: Release[]) {}
}

/**
 * For making lookups to https://musicbrainz.org/
 */
export class MusicBrainzApi {
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

  async searchLabel(labelName: string, limit: number): Promise<Label[]> {
    let params = new URLSearchParams();
    params.append("query", labelName);
    params.append("limit", limit.toString());

    let json = await this.musicBrainzRequest("label", "", params);

    let labels = (json.labels as any[]).map((label) => {
      return { mbid: label.id, name: label.name };
    });

    return labels;
  }

    /**
   * Get the urls associated with label 'labelMbid'.
   */
  async getLabelUrls(labelMbid: string): Promise<string[]> {
    let params = new URLSearchParams();
    params.append("inc", "url-rels");

    let json = await this.musicBrainzRequest("label", labelMbid, params);

    return json.relations
      .map((relation: any) => {
        console.log(relation);
        return relation?.url?.resource;
      })
      .filter((urlString: string) => urlString); // check that the url is defined
  }

  /**
   * Get the urls associated with label 'labelMbid', but only those that include the string 'include'.
   */
  async getCertainUrls(labelMbid: string, include: string) {
    let urls = await this.getLabelUrls(labelMbid);

    return urls.filter((urlString: string) => {
      return urlString.includes(include);
    });
  }

  async getLabelReleases(labelMbid: string, offset: number = 0): Promise<ReleaseLookupResult> {
    let params = new URLSearchParams();
    params.append("label", labelMbid);
    params.append("offset", offset.toString());

    let json = await this.musicBrainzRequest("release", "", params);

    let releases = (json.releases as any[]).map((release) => {
      return { mbid: release.id, name: release.title, date: release.date };
    });

    let result = new ReleaseLookupResult(json["release-count"], json["release-offset"], releases);
    return result;
  }
}
