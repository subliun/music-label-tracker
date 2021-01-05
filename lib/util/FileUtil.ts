
import fs from "fs";
import fetch from "node-fetch";

export async function download(url: string, savePath: string) {
  let file = fs.createWriteStream(savePath);

  let res = await fetch(url, {
    method: "GET",
  })

  res.body.pipe(file);

  res.body.on("error", (err: any) => {
    console.error("Error downloading file" + url + " to path " + savePath);
    throw err;
  });

  res.body.on("finish", () => {
    file.close();
  })
}