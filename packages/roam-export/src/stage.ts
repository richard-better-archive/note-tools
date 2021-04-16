import type { Page } from "playwright";
import {
  ROAM_LOGIN_URL,
  SELECTOR_EXPORT_DIALOG,
  SELECTOR_EXPORT_SPINNER,
  SELECTOR_ROAM_APP_WRAPPER,
  SELECTOR_LOADING_INDICATOR,
  ROAM_GRAPH_SELECTION_URL,
} from "./const";

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
export const detectStage = async (page: Page): Promise<STAGE> => {
  try {
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
  } catch {
    console.log("An error occured during detection");
  }

  console.log("stage: UNHANDLED");
  return "UNHANDLED";
};
