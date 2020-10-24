import {
  getInitialPage,
  loginToRoam,
  sleep,
  openGraph,
  openExportPopup,
  exportAll,
} from "./helpers";
import { detectStage } from "./stage";

export const roamExportMainLoop = async (
  email: string,
  password: string,
  graphName: string,
  formats: string[]
) => {
  const { page, browser } = await getInitialPage();

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
