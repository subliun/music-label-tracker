import { DateTime } from "luxon";

/**
 * For accessing the Spotify web api from the server side.
 */
export class SpotifyServerApi {
  readonly baseUrl = "https://api.spotify.com/v1/";

  accessToken: string | null = null;
  reauthInterval: NodeJS.Timeout | null = null;

  private readonly defaultSearchLimit = 5;

  constructor() {}

  isAuthorized() {
    return this.accessToken !== null;
  }

  /**
   * Authorises using the Client Credentials flow.
   */
  async authorise(clientId: string, clientSecret: string) {
    //Prevent the timer from running later if this is being run again with
    //different credentials for some reason
    if (this.reauthInterval) {
      clearTimeout(this.reauthInterval);
    }

    let params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    let b = Buffer.from(clientId + ":" + clientSecret);

    let response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Basic " + b.toString("base64"),
      },
    });

    let json: any;
    if (response.ok) {
      json = await response.json();
    } else {
      throw Error("Failed to authorise Spotify API: " + response);
    }

    //give ourselves plenty of time (reauth halfway through validity of token)
    let reauthTime = (json.expires_in * 1000) / 2;

    this.accessToken = json.access_token;
    this.reauthInterval = setTimeout(() => {
      this.authorise(clientId, clientSecret);
    }, reauthTime);
  }

  private async makeRequest(resource: string, params: URLSearchParams | null) {
    let paramString = "";
    if (params) {
      paramString = params.toString();
    }

    let json = await fetch(this.baseUrl + resource + "?" + paramString, {
      headers: {
        Authorization: "Bearer " + this.accessToken,
      },
    }).then((response) => response.json());

    return json;
  }

  async searchAlbum(q: string, limit: number = this.defaultSearchLimit) {
    let params = new URLSearchParams();
    params.append("q", q);
    params.append("type", "album");
    params.append("limit", limit.toString());

    return this.makeRequest("search", params);
  }

  async getMultipleAlbums(ids: string[]) {
    let params = new URLSearchParams();
    params.append("ids", ids.join(","));

    return this.makeRequest("albums", params);
  }
}
