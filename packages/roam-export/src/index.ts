import { downloadLoop } from "./download";
import {
  extractArchives,
  cleanBefore,
  cleanAfter,
  formatJsonExport,
} from "./helpers";

export const supportedExportFormats = ["JSON", "EDN", "Markdown"];
export type SupportedExportFormat = typeof supportedExportFormats[number];

export interface RoamExportOptions {
  email: string;
  password: string;
  graph: string;
  formats: SupportedExportFormat[];
  extract: boolean;
  debug: boolean;
  output: string;
}

export const validatedFormats = (
  formats: string[]
): SupportedExportFormat[] => {
  const supportedFormatStrings: string[] = formats;

  return formats.filter((format) =>
    supportedFormatStrings.includes(format)
  ) as SupportedExportFormat[];
};

export const runRoamExport = async (options: RoamExportOptions) => {
  const { email, password, graph, formats, output, debug, extract } = options;

  cleanBefore(output);

  const downloadSuccess = await downloadLoop(
    email,
    password,
    graph,
    formats,
    output,
    debug
  );

  if (!downloadSuccess) {
    process.exitCode = 1;
    return;
  }

  if (extract) {
    await extractArchives(output);
  }

  if (extract && formats.includes("JSON")) {
    formatJsonExport(graph, output);
  }

  await cleanAfter(output);
};
