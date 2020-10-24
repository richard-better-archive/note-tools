import yargs from "yargs";
import playwright from "playwright";
import type { Page } from "playwright";
import fs from "fs";
import path from "path";

const getArguments = () => {
  const args = yargs.options({
    email: {
      type: "string",
      demandOption: true,
      describe: "The email address of your Roam Research account.",
    },
    password: {
      type: "string",
      demandOption: true,
      describe:
        "The password of your Roam Research account. Only sent to Roam.",
    },
    graph: {
      type: "string",
      demandOption: true,
      describe: "The name of the graph you want to export",
    },
    formats: {
      type: "array",
      demandOption: false,
      choices: ["JSON", "Markdown"] as const,
      default: ["JSON"],
    },
  }).argv;

  return args;
};

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

const getInitialPage = async () => {
  const browser = await playwright.firefox.launch({ headless: false });
  const page = await browser.newPage({ acceptDownloads: true });

  attachDownloadListener(page);

  console.log(`Visiting ${ROAM_LOGIN_URL}`);
  await page.goto(ROAM_LOGIN_URL);

  return { page, browser };
};
const loginToRoam = async (page: Page, email: string, password: string) => {
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

const openGraph = async (page: Page, graphName: string) => {
  try {
    console.log("// Step: openGraph");

    console.log(`Selecting graph with name ${graphName}`);
    await page.click(`'${graphName}'`);
    console.log(`Graph opening!`);
  } catch {
    console.log("// Failed: openGraph");
  }
};

const openExportPopup = async (page: Page) => {
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

const exportAll = async (page: Page, format: string) => {
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

const ROAM_LOGIN_URL = "https://roamresearch.com/#/signin";
const ROAM_GRAPH_SELECTION_URL = "https://roamresearch.com/#/app";

const SELECTOR_ROAM_APP_WRAPPER = ".roam-app";
const SELECTOR_EXPORT_DIALOG = ".bp3-dialog";
const SELECTOR_EXPORT_SPINNER = ".bp3-spinner.bp3-intent-primary";
const SELECTOR_LOADING_INDICATOR = ".loading-astrolabe";

type STAGE =
  | "INIT"
  | "LOGGED_OUT"
  | "LOADING"
  | "GRAPH_SELECT"
  | "GRAPH_LOADED"
  | "EXPORT_POPUP"
  | "EXPORT_IN_PROGRESS"
  | "UNHANDLED";

/*
Since Roam can be a bit erratic, we always check what stage we're in before doing operation
*/
const detectStage = async (page: Page): Promise<STAGE> => {
  const pageUrl = page.url();

  const isLoginPage = pageUrl === ROAM_LOGIN_URL;

  if (isLoginPage) {
    console.log("stage: LOGGED_OUT");
    return "LOGGED_OUT";
  }

  const isExportDialogVisible = await page.$(SELECTOR_EXPORT_DIALOG);
  const isExportSpinnerVisible = await page.$(SELECTOR_EXPORT_SPINNER);

  if (isExportDialogVisible && isExportSpinnerVisible) {
    console.log("stage: EXPORT_IN_PROGRESS");
    return "EXPORT_IN_PROGRESS";
  }

  if (isExportDialogVisible && !isExportSpinnerVisible) {
    console.log("stage: EXPORT_POPUP");
    return "EXPORT_POPUP";
  }

  const isAppWrapperVisible = await page.$(SELECTOR_ROAM_APP_WRAPPER);
  const isLoadingIndicatorVisible = await page.$(SELECTOR_LOADING_INDICATOR);

  if (isAppWrapperVisible && !isLoadingIndicatorVisible) {
    console.log("stage: GRAPH_LOADED");
    return "GRAPH_LOADED";
  }

  if (isLoadingIndicatorVisible && !isAppWrapperVisible) {
    console.log("stage: LOADING");
    return "LOADING";
  }

  const isGraphSelectionPage = pageUrl === ROAM_GRAPH_SELECTION_URL;
  if (isGraphSelectionPage) {
    console.log("stage: GRAPH_SELECT");
    return "GRAPH_SELECT";
  }

  console.log("stage: UNHANDLED");
  return "UNHANDLED";
};

const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
};

const mainLoop = async () => {
  const { page, browser } = await getInitialPage();
  const { email, password, graph: graphName, formats } = getArguments();

  let run = true;
  const toExport = [...formats];

  while (run) {
    const stage = await detectStage(page);

    if (stage !== "EXPORT_IN_PROGRESS" && toExport.length === 0) {
      run = false;
      process.exitCode = 0;
      break;
    }

    switch (stage) {
      case "LOGGED_OUT":
        // Logged out state, we need to login
        await loginToRoam(page, email, password);
        break;
      case "EXPORT_IN_PROGRESS":
      case "UNHANDLED":
      case "LOADING":
        // either the graph, or the graph selection is loading
        await sleep(1);
        break;
      case "GRAPH_SELECT": // Graph selection screen
        await openGraph(page, graphName);
        break;
      case "GRAPH_LOADED":
        // The graph is loaded.
        // Check if exports have started, and open export popup if not
        // If all exports are done, close the browser
        await openExportPopup(page);
        break;
      case "EXPORT_POPUP":
        // The export popup is open,
        // and start the next export
        const successfulExport = await exportAll(page, toExport[0]);
        if (successfulExport) {
          toExport.shift();
          await sleep(5);
        } else {
          console.log("export failed, reloading page");
          await page.reload();
        }
        break;
      default:
        run = false;
        process.exitCode = 1;
        break;
    }
  }

  browser.close();
};

mainLoop();
