import path from "path";
import fs from "fs";
import { createHash } from "crypto";

import fetch from "node-fetch";

export const getFolderOrCwd = (outDir?: string) => {
  let folder = outDir ?? process.cwd();

  folder = path.resolve(folder);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  return folder;
};

export const getPredictableFileName = (url: string) => {
  const parsedUrl = new URL(url);

  const pathname = parsedUrl.pathname;
  const parsedPath = path.parse(pathname);
  const extension = parsedPath.ext;

  const hash = createHash("md5").update(url).digest("hex");

  return `${hash}${extension}`;
};

export const getFileLocalPath = (
  mdFile: string,
  fileFolder: string,
  fileFileName: string
) => {
  const filePath = path.join(fileFolder, fileFileName);

  return path.relative(path.dirname(mdFile), filePath);
};

export const downloadFile = async (url: string, path: string) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};
