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

export const runRoamExport = (options: RoamExportOptions) => {
  console.log("runRoamExport", options);
};
