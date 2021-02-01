import { MusicBrainzApi } from "../musicbrainz/MusicBrainzApi";
import ProfilePictureExtractor from "../ProfilePictureExtractor";
import * as FileUtil from "../../lib/util/FileUtil";

export class ImageFetcher {

  private mbApi: MusicBrainzApi;

  private readonly labelImageCachePath = "cache/label_image_cache/";
  private readonly releaseGroupImageCachePath = "cache/release_group_image_cache/";

  constructor() {
    this.mbApi = new MusicBrainzApi();
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
      console.log("Found cached label image at: " + filePath);
      return filePath;
    }

    let labelUrls = await this.mbApi.getLabelUrls(mbid);

    let twitterUrls = labelUrls.filter(u => u.includes("twitter.com"));
    let discogsUrls = labelUrls.filter(u => u.includes("discogs.com"));

    console.log(twitterUrls);

    if (twitterUrls.length > 0) {
      let imageUrl = await profileExtractor.extractTwitterPhotoUrl(twitterUrls[0]);

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