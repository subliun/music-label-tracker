import Puppeteer from "puppeteer";

export default class ProfilePictureExtractor {

  private browserInstance: Puppeteer.Browser;

  constructor(browserInstance: Puppeteer.Browser) {
    this.browserInstance = browserInstance;
  }

  async extractTwitterPhotoUrl(twitterProfileUrl: string): Promise<string | null> {
    //I don't trust that the urls are uniformly formatted. Check.
    let photoExtension = "photo";
    if (twitterProfileUrl[twitterProfileUrl.length - 1] != "/") {
      photoExtension = "/" + photoExtension;
    }

    const twitterPhotoUrl = twitterProfileUrl + photoExtension;
    console.log("Twitter Photo URL: " + twitterPhotoUrl);

    //Use a headless browser to extract the twitter profile picture so that we don't have
    //to use the Twitter API.
    //This is truly awful.
    const page = await this.browserInstance.newPage();

    const photoUrlPromise = new Promise<string | null>((resolve, reject) => {
      //Intercept all requests that the twitter page makes until it requests the profile picture, then
      //stop the page load and abort
      page.setRequestInterception(true);
      page.on("request", (interceptedRequest) => {
        const re = /https:.+?400x400.+/;
        const photoUrl = interceptedRequest.url().match(re);

        if (photoUrl) {
          resolve(photoUrl[0]);
          interceptedRequest.abort();
        } else {
          interceptedRequest.continue();
        }
      });

      //Prevent the page from remaining open forever if the profile picture is not found
      const timeoutTime = 4000;
      setTimeout(() => {
        resolve(null);
      }, timeoutTime);
    });

    page.goto(twitterPhotoUrl);
    const photoUrl = await photoUrlPromise;

    page.close();

    return photoUrl;
  }

  extractDiscogsPicture(discogsItemUrl: string): string {
    //TODO
    return "";
  }
}
