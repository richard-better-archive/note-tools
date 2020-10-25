#!/usr/bin/env node
import yargs from "yargs";
import { backupMarkdownFiles } from "./backup-markdown-files";
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
    },
    handler: (parsed) => {
      backupMarkdownFiles(
        parsed.source as string | undefined,
        parsed.files as string | undefined,
        parsed.replace as boolean
      );
    },
  })
  .demandCommand()
  .help("help").argv;
