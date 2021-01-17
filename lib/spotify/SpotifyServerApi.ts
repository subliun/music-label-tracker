export class SpotifyServerApi {
  readonly baseUrl = "https://api.spotify.com/v1/";
  
  accessToken: string | null = null;

  private readonly defaultSearchLimit = 5;

  isAuthorized() {
    return this.accessToken !== null;
  }

  async authorise(clientId: string, clientSecret: string) {
    let params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    let b = Buffer.from(clientId + ":" + clientSecret);

    let json = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Basic " + b.toString("base64"),
      },
    }).then((response) => response.json());

    console.log(json);

    this.accessToken = json.access_token; 
  }

  async makeRequest(resource: string, params: URLSearchParams | null) {
    let paramString = "";
    if (params) {
      paramString = params.toString();
    }

    let json = await fetch(this.baseUrl + resource + "?" + paramString, {
      headers: {
        "Authorization": "Bearer " + this.accessToken
      }
    }).then((response) => response.json());

    console.log(json);

    return json;
  }

  async searchAlbum(q: string, limit: number = this.defaultSearchLimit) {
    let params = new URLSearchParams();
    params.append("q", q);
    params.append("type", "album");
    params.append("limit", limit.toString());

    return this.makeRequest("search", params);
  }
}
