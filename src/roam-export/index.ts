import { downloadLoop } from "./download";
import { extractArchives, cleanBefore, cleanAfter } from "./helpers";

export const roamExportMainLoop = async (
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

  await cleanAfter(outDir);
};
