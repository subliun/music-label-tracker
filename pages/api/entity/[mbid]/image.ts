import { NextApiRequest, NextApiResponse } from "next";
import ProfilePictureExtractor from "../../../../lib/ProfilePictureExtractor";

import Puppeteer from "puppeteer";
import { SearchEngine } from "../../../../lib/fetcher/SearchEngine";

import * as FileUtil from "../../../../lib/util/FileUtil";
import * as Db from "../../../../lib/db/Db";
import { MbEntityType } from "../../../../lib/struct/MbEntityType";
import { MbEntity } from "../../../../lib/struct/MbEntity";

let profileExtractor: ProfilePictureExtractor | null;
let fetcher = new SearchEngine();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!profileExtractor) {
    profileExtractor = new ProfilePictureExtractor(await Puppeteer.launch());
  }

  let unsafeMbid = req.query.mbid;

  // a music brainz id is required
  if (!unsafeMbid || !(typeof unsafeMbid === "string")) {
    res.statusCode = 400;
    res.end();
    return;
  }

  let entityType = MbEntityType.LABEL; //req.query.entityType;
  // if (!entityType || !(entityType === MbEntityType.LABEL || entityType === MbEntityType.RELEASE)) {
  //   console.error("invalid entity type");
  //   res.statusCode = 400;
  //   res.end();
  //   return;
  // }

  // Remove all dots to prevent path traversal
  let re = /\./g
  let safeMbid = unsafeMbid.replace(re, "");

  let imagePath: string | null = null;

  if (entityType === MbEntityType.LABEL) {
    imagePath = await fetcher.loadLabelImage(safeMbid, profileExtractor);
  } else if (entityType === MbEntityType.RELEASE) {
    // let release = await Db.readRelease(safeMbid);
    // if (release) {
    //   imagePath = await fetcher.loadReleaseGroupImage(release);
    // }
  }
  
  console.log("Found image link: " + imagePath);

  if (!imagePath) {
    res.statusCode = 404;
    res.end();
    return;
  }

  try {
    let stream = await FileUtil.createReadStream(process.cwd() + "/" + imagePath);
    res.setHeader("Content-Type", "image/jpeg");
    stream.pipe(res);
  } catch (err) {
    console.error("Error sending image " + err);
    res.status(500).end();
  }

};
