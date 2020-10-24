import playwright from "playwright";
import type { Page } from "playwright";
import fs from "fs";
import path from "path";

import { ROAM_LOGIN_URL } from "./const";

const attachDownloadListener = (page: Page, outDir?: string) => {
  const downloadFolder = outDir ?? process.cwd();

  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  page.on("download", async (download) => {
    const fileName = download.suggestedFilename();
    const downloadPath = path.join(downloadFolder, fileName);

    console.log(`A download is initiated, saving to ${downloadPath}`);
    await download.saveAs(downloadPath);
    console.log(`${fileName} saved`);
  });
};

export const getInitialPage = async () => {
  const browser = await playwright.firefox.launch({ headless: false });
  const page = await browser.newPage({ acceptDownloads: true });

  attachDownloadListener(page);

  console.log(`Visiting ${ROAM_LOGIN_URL}`);
  await page.goto(ROAM_LOGIN_URL);

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
      resolve();
    }, seconds * 1000);
  });
};
