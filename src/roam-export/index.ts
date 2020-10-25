import { downloadLoop } from "./download";
import {
  extractArchives,
  cleanBefore,
  cleanAfter,
  formatJsonExport,
} from "./helpers";

export const roamExport = async (
  email: string,
  password: string,
  graphName: string,
  formats: string[],
  outDir: string,
  extractFiles: boolean,
  debug: boolean
) => {
  cleanBefore(outDir);

  const downloadSuccess = await downloadLoop(
    email,
    password,
    graphName,
    formats,
    outDir,
    debug
  );

  if (!downloadSuccess) {
    process.exitCode = 1;
    return;
  }

  if (extractFiles) {
    await extractArchives(outDir);
  }

  if (extractFiles && formats.includes("JSON")) {
    formatJsonExport(graphName, outDir);
  }

  await cleanAfter(outDir);
};
