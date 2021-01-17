import fs from "fs";
import fetch from "node-fetch";

/**
 * Create a new folder. If the folder already exists, this function will do nothing.
 *
 * If parent folders do not exist, they will be created.
 *
 * @param folderPath the path for the new folder.
 */
export async function createFolder(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    })
  })
}

export async function download(url: string, savePath: string) {
  let res = await fetch(url, {
    method: "GET",
  });

  return new Promise<void>((resolve, reject) => {
    if (!res.ok) {
      reject("Error code download: " + res.status);
      return;
    }

    let file = fs.createWriteStream(savePath);

    res.body.pipe(file);

    res.body.on("error", (err: any) => {
      console.error("Error downloading file" + url + " to path " + savePath);
      reject(err);
    });

    res.body.on("finish", () => {
      file.close();
      resolve();
    });
  });
}

/**
 * Check if a given file exists.
 */
export async function exists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.access(filePath, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function createReadStream(path: string): Promise<fs.ReadStream> {
  return new Promise((resolve, reject) => {
    let s = fs.createReadStream(path);
    s.on("open", () => {
      resolve(s);
    });

    s.on("error", (err) => {
      reject(err);
    });
  });
}
