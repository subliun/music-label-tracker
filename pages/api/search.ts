import { MusicBrainzApi } from "../../lib/musicbrainz/MusicBrainzApi";
import { NextApiRequest, NextApiResponse } from "next";

import ProfilePictureExtractor from "../../lib/ProfilePictureExtractor";
import { LabelFetcher } from "../../lib/fetcher/LabelFetcher";

import * as Constants from "../../lib/util/Constants";

import Puppeteer from "puppeteer";

import * as Db from "../../lib/db/Db";

const DEFAULT_REQUEST_COUNT = 5;
const MAX_REQUEST_COUNT = 10;

let profileExtractor: ProfilePictureExtractor | null;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!profileExtractor) {
    profileExtractor = new ProfilePictureExtractor(await Puppeteer.launch());
  }

  console.log(req.socket.address);

  let q = req.query.q;
  //The query string is mandatory
  if (!q || !(typeof q === 'string') || q.length > Constants.MAX_SEARCH_STRING_LENGTH) {
    res.statusCode = 400;
    res.end();
    return;
  }

  //Validate the number of records requested
  let n: number = DEFAULT_REQUEST_COUNT;
  try {
    let temp = parseInt(req.query.n as string);
    if (!isNaN(temp)) {
      n = temp;
      if (n < 0 || n > MAX_REQUEST_COUNT) {
        throw Error("Invalid number of records requested");
      }
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 400;
    res.end();
    return;
  }

  let fetcher = new LabelFetcher(profileExtractor);
  let labels = await fetcher.searchLabel(q, n);
  if (labels.length > 0) {
    console.log(labels[0].name);

    let picture = await fetcher.getLabelPicture(labels[0].mbid);
    console.log("Found picture link: " + picture);

    res.statusCode = 200;
    res.json({ picture: picture });
  } else {
    res.json({ picture: "" });
  }
};
