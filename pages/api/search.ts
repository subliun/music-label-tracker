import { NextApiRequest, NextApiResponse } from "next";

import { LabelFetcher } from "../../lib/fetcher/LabelFetcher";

import * as Constants from "../../lib/util/Constants";

import * as Db from "../../lib/db/Db";
import { Release } from "../../lib/struct/Release";

const DEFAULT_REQUEST_COUNT = 5;
const MAX_REQUEST_COUNT = 10;

/**
 * The core search functionality of the application. Attempts to
 * find matching labels from the query string.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.socket.address());

  let q = req.query.q;
  //The query string is mandatory
  if (!q || !(typeof q === 'string') || q.length > Constants.MAX_SEARCH_STRING_LENGTH) {
    res.statusCode = 400;
    res.end();
    return;
  }

  //We don't care about case, and this reduces the amount of storage required for the DB search cache.
  q = q.toLowerCase();

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

  let fetcher = new LabelFetcher();
  let releases = await fetcher.searchRelease(q, n);

  let uniqueGroupMbids = Array.from(new Set(releases.map(release => release.releaseGroupMbid)));
  let uniqueReleases: Release[] = [];

  for (let uniqueId of uniqueGroupMbids) {
    let index = releases.map(release => release.releaseGroupMbid).indexOf(uniqueId);
    uniqueReleases.push(releases[index]);
  }
  
  if (releases.length > 0) {
    fetcher.loadReleaseGroupImage(releases[0]);
  }

  res.statusCode = 200;
  res.json({releases: uniqueReleases});
};
