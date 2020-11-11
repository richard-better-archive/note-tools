#!/usr/bin/env node
import yargs from "yargs";
import {
  backupMarkdownFiles,
  copyDirectory,
  deleteDirectory,
} from "./backup-markdown-files";
import { roamExport } from "./roam-export";

yargs
  .usage("usage: $0 <command>")
  .command({
    command: "roam-export",
    describe: "Export your notes from Roam Research",
    builder: {
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
        choices: ["JSON", "EDN", "Markdown"] as const,
        default: ["JSON"],
      },
      extract: {
        type: "boolean",
        default: true,
      },
      output: {
        type: "string",
        demandOption: false,
      },
      debug: {
        type: "boolean",
        describe: "Open the browser instead of using a headless version.",
        default: false,
      },
    },
    handler: (parsed) =>
      roamExport(
        parsed.email as string,
        parsed.password as string,
        parsed.graph as string,
        parsed.formats as string[],
        parsed.output as string,
        parsed.extract as boolean,
        parsed.debug as boolean
      ),
  })
  .command({
    command: "backup-markdown-files",
    describe: "Save linked files and images locally",

    builder: {
      source: {
        type: "string",
        demandOption: true,
        describe: "The folder containing markdown files to search in",
      },
      files: {
        type: "string",
        demandOption: true,
        describe:
          "The output folder, where the downloaded files will be written",
      },
      replace: {
        type: "boolean",
        demandOption: false,
        describe:
          "Replace the links in the files with the relative local paths",
      },
      output: {
        type: "string",
        demandOption: false,
        describe:
          "The folder where the markdown files with replaced output will be written. Only one of replace or output can be set.",
      },
    },
    handler: async (parsed) => {
      if (parsed.output) {
        // If we have an output specified, copy the files there, and replace the content
        await deleteDirectory(parsed.output as string);
        copyDirectory(parsed.source as string, parsed.output as string);

        backupMarkdownFiles(
          parsed.output as string | undefined,
          parsed.files as string | undefined,
          true
        );
      } else {
        backupMarkdownFiles(
          parsed.source as string | undefined,
          parsed.files as string | undefined,
          parsed.replace as boolean
        );
      }
    },
  })
  .conflicts("replace", "output")
  .demandCommand()
  .help("help").argv;
