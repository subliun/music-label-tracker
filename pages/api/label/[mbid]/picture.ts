import { NextApiRequest, NextApiResponse } from "next";
import ProfilePictureExtractor from "../../../../lib/ProfilePictureExtractor";

import Puppeteer from "puppeteer";
import { LabelFetcher } from "../../../../lib/fetcher/LabelFetcher";

import * as FileUtil from "../../../../lib/util/FileUtil";
import * as Db from "../../../../lib/db/Db";

let profileExtractor: ProfilePictureExtractor | null;
let fetcher = new LabelFetcher();

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

  //check that the mbid is in the database.
  //this prevents path traversal from the mbid string
  let label = await Db.readLabel(unsafeMbid);

  if (!label) {
    res.statusCode = 400;
    res.end();
    return;
  }

  //remove all dots to ensure that we're not using a path written to the database
  //if MusicBrainz is hijacked to return a path as an mbid this might come up
  //again this is to prevent path traversal
  let safeMbid = label.mbid.replaceAll(".", "");

  let picturePath = await fetcher.getLabelPicturePath(safeMbid, profileExtractor);
  console.log("Found picture link: " + picturePath);

  try {
    let stream = await FileUtil.createReadStream(process.cwd() + "/" + picturePath);
    res.setHeader("Content-Type", "image/jpeg");
    stream.pipe(res);
  } catch (err) {
    console.error("Error sending picture " + err);
    res.status(500).end();
  }

};
