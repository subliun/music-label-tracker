import { MusicBrainzApi } from "../../lib/MusicBrainzApi";
import { NextApiRequest, NextApiResponse } from "next";

import ProfilePictureExtractor from "../../lib/ProfilePictureExtractor";

import * as Constants from "../../lib/util/Constants";

import Puppeteer from "puppeteer";

import * as Db from "../../lib/db/Db";

Db.helloWorld();

const DEFAULT_REQUEST_COUNT = 5;
const MAX_REQUEST_COUNT = 10;

let pictureExtractor: ProfilePictureExtractor | null = null;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //TODO: Hack to use single instance
  if (!pictureExtractor) {
    pictureExtractor = new ProfilePictureExtractor(await Puppeteer.launch());
  }

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
    n = parseInt(req.query.n as string);
    if (n < 0 || n > MAX_REQUEST_COUNT) {
      throw Error("Invalid number of records requested");
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 400;
    res.end();
    return;
  }

  let api = new MusicBrainzApi();
  let label = await api.searchLabel(q);
  if (label.labels.length > 0) {
    console.log(label.labels[0].name);

    let picture = await api.getLabelPicture(label.labels[0].musicBrainzId, pictureExtractor);
    console.log("Found picture link: " + picture);

    res.statusCode = 200;
    res.json({ picture: picture });
  } else {
    res.json({ picture: "" });
  }
};
