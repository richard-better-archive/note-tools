import path from "path";
import fs from "fs";
import { glob } from "glob";
import { createHash } from "crypto";

import sra from "string-replace-async";
import prettier from "prettier";
import fetch from "node-fetch";

export const getFolderOrCwd = (outDir?: string) => {
  let folder = outDir ?? process.cwd();

  folder = path.resolve(folder);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  return folder;
};

const getPredictableFileName = (url: string) => {
  const parsedUrl = new URL(url);

  const pathname = parsedUrl.pathname;
  const parsedPath = path.parse(pathname);
  const extension = parsedPath.ext;

  const hash = createHash("md5").update(url).digest("hex");

  return `${hash}${extension}`;
};

const getFileLocalPath = (
  mdFile: string,
  fileFolder: string,
  fileFileName: string
) => {
  const filePath = path.join(fileFolder, fileFileName);

  return path.relative(path.dirname(mdFile), filePath);
};

const downloadFile = async (url: string, path: string) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

const MD_IMAGE_REGEX = /!\[[^\]\r\n]*\]\((?<url>[^)\r\n]*)\)/g;
const ROAM_PDF_REGEX = /{{pdf: (?<url>[^}]*)}}/g;

export const backupMarkdownFiles = async (
  mdFolderParam?: string,
  filesFolderParam?: string,
  replace?: boolean
) => {
  const mdFolder = getFolderOrCwd(mdFolderParam);
  const filesFolder = getFolderOrCwd(filesFolderParam);
  const mappingFilePath = path.join(filesFolder, "mappings.json");

  const markdownFileNames = glob.sync(`${mdFolder}/**/*.md`);

  // Step 1: go through all files, build a map of resources, genereate deterministic local names for them, and optionally replace link

  const sourceMappings: { [file: string]: string[] } = {};
  const fileMappings: { [url: string]: string } = {};

  for (const fileName of markdownFileNames) {
    const fileContent = await fs.promises.readFile(fileName, "utf8");
    let transformedContent: string;

    const found: [string, string][] = [];

    transformedContent = await sra(
      fileContent,
      MD_IMAGE_REGEX,
      async (match, url) => {
        if (!/^http/.test(url)) {
          // ignore local images
          return match;
        }

        const newFileName = getPredictableFileName(url);
        const localPath = getFileLocalPath(fileName, filesFolder, newFileName);
        console.log(localPath);
        found.push([url, newFileName]);
        return match.replace(url, `${localPath}`);
      }
    );

    transformedContent = await sra(
      transformedContent,
      ROAM_PDF_REGEX,
      async (match, url) => {
        if (!/^http/.test(url)) {
          // ignore local images
          return match;
        }

        const newFileName = getPredictableFileName(url);
        const localPath = getFileLocalPath(fileName, filesFolder, newFileName);
        console.log(localPath);
        found.push([url, newFileName]);

        return match.replace(url, `${localPath}`);
      }
    );

    if (found.length > 0) {
      const plainFileName = path.relative(mdFolder, fileName);

      sourceMappings[plainFileName] = found.map(([url]) => url);
      found.forEach(([url, fileName]) => (fileMappings[url] = fileName));
    }

    if (replace && transformedContent !== fileContent) {
      await fs.promises.writeFile(fileName, transformedContent, "utf-8");
    }
  }

  // Step 2: Save the mappings
  for (const [url, fileName] of Object.entries(fileMappings)) {
    const filePath = path.join(filesFolder, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`Downloading ${url} into ${fileName}`);
      await downloadFile(url, filePath);
    } else {
      console.log(`Skipping ${url} as it already exists as ${fileName}`);
    }
  }

  // Step 3: Download all files

  const mappings = JSON.stringify({ sourceMappings, fileMappings });
  const formattedMappings = prettier.format(mappings, { parser: "json" });

  await fs.promises.writeFile(mappingFilePath, formattedMappings);
};
