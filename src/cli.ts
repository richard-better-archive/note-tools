import { Cli } from "clipanion";
import { getVersion, loadPackageJson } from "json.macro";

import { HelpCommand, VersionCommand } from "./common";
import type { CommandContext } from "./common";
import { RoamExportCommand } from "./roam";

const version = getVersion();
const description = loadPackageJson("description") ?? "";
const name = loadPackageJson("name") ?? "";

const cli = new Cli<CommandContext>({
  binaryLabel: description,
  binaryName: `note-tools`,
  binaryVersion: version,
});

cli.register(HelpCommand);
cli.register(VersionCommand);
cli.register(RoamExportCommand);

cli.runExit(process.argv.slice(2), {
  version,
  description,
  name,
  internal: false,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
});
