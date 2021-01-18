import { NextApiRequest, NextApiResponse } from "next";
import { SearchEngine } from "../../lib/fetcher/SearchEngine";
import { Release } from "../../lib/struct/Release";

const DEFAULT_REQUEST_COUNT = 3;
const MAX_REQUEST_COUNT = 10;

let searchEngine = new SearchEngine();

/**
 * The core search functionality of the application. Attempts to
 * find matching labels from the query string.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!searchEngine.isInitialized) {
    await searchEngine.initialize();
  }
  
  let q = req.query.q;
  //The query string is mandatory
  if (!q || !(typeof q === 'string')) {
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

  console.time("release lookup");
  let releases = await searchEngine.searchRelease(q, 3);
  console.timeEnd("release lookup");

  console.time("label lookup");
  let labels = await searchEngine.searchLabel(q, 3);
  console.timeEnd("label lookup");

  res.status(200).send({releases: releases, labels: labels});
};
