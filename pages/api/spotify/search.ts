import { NextApiRequest, NextApiResponse } from "next";
import { SpotifyServerApi } from "../../../lib/spotify/SpotifyServerApi";
import * as FileUtil from "../../../lib/util/FileUtil";

let api = new SpotifyServerApi();

let words: string[] | null;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let clientId = process.env.SPOTIFY_CLIENT_ID;
  let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (clientId && clientSecret && !api.isAuthorized()) {
    await api.authorise(clientId, clientSecret);
  }

  if (!words) {
    words = (await FileUtil.readFile("/usr/share/dict/words")).split("\n");
  }

  for (let i = 0; i < 10; i++) {
    let word = words[Math.floor(Math.random() * (words.length - 1))];
    console.log(word);

    const delay = 4000;
    setTimeout(async () => {
      let name = await api.searchAlbum(word);
      console.log(name?.albums?.items?.[0]?.name);

    }, delay * Math.random());
  }

  let json = await api.searchAlbum(req.query.q as string)

  res.status(200).send(json);
}