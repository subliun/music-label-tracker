import { NextApiRequest, NextApiResponse } from "next";
import { MusicBrainzDb } from "../../lib/db/MusicBrainzDb";
import { MAX_ADDABLE_MBIDS } from "../../lib/util/Constants";

let mbDb = new MusicBrainzDb();


export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let mbids = (req.query.mbids as string).split(",");

    if (mbids.length > MAX_ADDABLE_MBIDS) {
      throw Error("Too many mbids requested");
    }

    let labels = await mbDb.getLabels(mbids);

    console.log("sending: " + labels)
    res.send({labels: labels});
  } catch (error) {
    res.status(400).end()
  }
}