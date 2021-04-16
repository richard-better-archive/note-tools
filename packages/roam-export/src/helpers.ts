import playwright from "playwright";
import type { Page } from "playwright";
import fs from "fs";
import path from "path";
import del from "del";
import prettier from "prettier";

import { ROAM_LOGIN_URL } from "./const";
import extract from "extract-zip";
import glob from "glob";

export const getOutputFolder = (outDir?: string) => {
  let outputFolder = outDir ?? process.cwd();

  outputFolder = path.resolve(outputFolder);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  return outputFolder;
};

const attachDownloadListener = (page: Page, outDir?: string) => {
  const outputFolder = getOutputFolder(outDir);

  page.on("download", async (download) => {
    const fileName = download.suggestedFilename();
    const downloadPath = path.join(outputFolder, fileName);

    console.log(`A download is initiated, saving to ${downloadPath}`);
    await download.saveAs(downloadPath);
    console.log(`${fileName} saved`);
  });
};

export const getInitialPage = async (headless: boolean, outDir?: string) => {
  const browser = await playwright.chromium.launch({ headless });
  const page = await browser.newPage({ acceptDownloads: true });

  console.log(`Visiting ${ROAM_LOGIN_URL}`);
  await page.goto(ROAM_LOGIN_URL);

  attachDownloadListener(page, outDir);

  return { page, browser };
};

export const loginToRoam = async (
  page: Page,
  email: string,
  password: string
) => {
  try {
    console.log("// Step: loginToRoam");

    console.log(`Filling in email ${email}`);
    await page.fill("[name='email']", email);
    console.log(`Filling in password ${password}`);
    await page.fill("[name='password']", password);

    const buttons = await page.$$("#app button");
    const signInButton = buttons.find(
      async (b) => (await b.textContent()) === "Sign In"
    );

    if (signInButton) {
      console.log("Waiting for login success");
      await Promise.all([signInButton.click(), page.waitForNavigation()]);
    } else {
      throw new Error("Sign in button is not on the page");
    }
  } catch {
    console.log("// Failed: loginToRoam");
  }
};

export const openGraph = async (page: Page, graphName: string) => {
  try {
    console.log("// Step: openGraph");

    console.log(`Selecting graph with name ${graphName}`);
    await page.click(`'${graphName}'`);
    console.log(`Graph opening!`);
  } catch {
    console.log("// Failed: openGraph");
  }
};

export const openExportPopup = async (page: Page) => {
  try {
    console.log("// Step: openExportPopup");

    console.log("Opening more menu.");
    await page.click(".bp3-icon-more", { timeout: 1 * 1000 });

    console.log("Opening export popup");
    await page.click("'Export All'");
  } catch {
    console.log("// Failed: openExportPopup");
  }
};

export const exportAll = async (page: Page, format: string) => {
  try {
    console.log(`// Step: exportAll:${format}`);
    const currentSelected = await page.textContent(
      ".bp3-dialog .bp3-popover-target .bp3-button-text",
      { timeout: 10 * 1000 }
    );

    console.log({ currentSelected });

    if (!currentSelected) throw Error("Page is not as expexted");

    if (currentSelected.toLowerCase() === format) {
      console.log(`Format ${format} is selected, exporting....`);
      page.click("text='Export All'");
    }

    console.log("Listing export format options");
    await page.click(".bp3-dialog .bp3-popover-target .bp3-icon-caret-down");

    console.log(`Selecting ${format}`);
    await page.click(`'${format}'`);

    console.log(`Format ${format} has been selected, exporting....`);
    page.click("'Export All'");
  } catch {
    return false;
  }

  return true;
};

export const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, seconds * 1000);
  });
};

export const extractArchives = async (outDir?: string) => {
  const outputFolder = getOutputFolder(outDir);

  const zipPattern = path.join(outputFolder, "*.zip");
  const filenames = glob.sync(zipPattern);

  await Promise.all(
    filenames.map(async (filename) => {
      const parsedPath = path.parse(filename);
      const zipFolder = path.join(parsedPath.dir, parsedPath.name);

      const extensions: string[] = [];

      await extract(filename, {
        dir: zipFolder,
        onEntry: (entry) => {
          extensions.push(path.parse(entry.fileName).ext);
        },
      });

      if (extensions.length === 1 && extensions[0] === ".json") {
        console.log(`${filename} contains json export`);
        fs.renameSync(zipFolder, path.join(outputFolder, "json"));
      } else if (extensions.length === 1 && extensions[0] === ".edn") {
        console.log(`${filename} contains edn export`);
        fs.renameSync(zipFolder, path.join(outputFolder, "edn"));
      } else {
        console.log(`${filename} contains markdown export`);
        fs.renameSync(zipFolder, path.join(outputFolder, "markdown"));
      }
    })
  );
};

export const cleanBefore = async (outDir?: string) => {
  const outputFolder = getOutputFolder(outDir);

  const zipPattern = path.join(outputFolder, "*.zip");
  const nonRenamedFolderPattern = path.join(outputFolder, "Roam-Export-*");

  const deletedPaths = await del([
    path.join(outputFolder, "json"),
    path.join(outputFolder, "edn"),
    path.join(outputFolder, "markdown"),
    zipPattern,
    nonRenamedFolderPattern,
  ]);

  console.log(`Removed files ${deletedPaths.join(", ")}`);
};

export const cleanAfter = async (outDir?: string) => {
  const outputFolder = getOutputFolder(outDir);

  const zipPattern = path.join(outputFolder, "*.zip");
  const nonRenamedFolderPattern = path.join(outputFolder, "Roam-Export-*");

  const deletedPaths = await del([zipPattern, nonRenamedFolderPattern]);

  console.log(`Removed files ${deletedPaths.join(", ")}`);
};

export const formatJsonExport = (graphName: string, outDir?: string) => {
  const outputFolder = getOutputFolder(outDir);
  const fileLocation = path.join(outputFolder, "json", `${graphName}.json`);

  const exists = fs.existsSync(fileLocation);

  if (!exists) return;

  const jsonFile = fs.readFileSync(fileLocation, "utf8");

  const formatted = prettier.format(jsonFile, { parser: "json" });

  fs.writeFileSync(fileLocation, formatted);
};
