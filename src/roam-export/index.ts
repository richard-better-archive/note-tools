import {
  getInitialPage,
  loginToRoam,
  sleep,
  openGraph,
  openExportPopup,
  exportAll,
  extractArchives,
  cleanBefore,
  cleanAfter,
} from "./helpers";
import { detectStage } from "./stage";

export const roamExportMainLoop = async (
  email: string,
  password: string,
  graphName: string,
  formats: string[],
  outDir: string,
  extractFiles: boolean
) => {
  const { page, browser } = await getInitialPage(outDir);

  let run = true;
  let success: boolean | undefined = undefined;
  const toExport = [...formats];

  cleanBefore(outDir);

  while (run) {
    const stage = await detectStage(page);

    if (stage !== "EXPORT_IN_PROGRESS" && toExport.length === 0) {
      run = false;
      success = true;
      break;
    }

    switch (stage) {
      case "LOGGED_OUT":
        // Logged out state, we need to login
        await loginToRoam(page, email, password);
        break;
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
        const successfulExport = await exportAll(
          page,
          toExport[0],
          extractFiles,
          outDir
        );
        if (successfulExport) {
          toExport.shift();
          await sleep(5);
        } else {
          console.log("export failed, reloading page");
          await page.reload();
        }
        break;
      case "EXPORT_IN_PROGRESS":
        await sleep(10);
        break;
      default:
        run = false;
        success = false;
        break;
    }
  }

  browser.close();

  if (extractFiles) {
    await extractArchives(outDir);
  }

  await cleanAfter(outDir);

  if (!success) {
    process.exitCode = 1;
  }
};
