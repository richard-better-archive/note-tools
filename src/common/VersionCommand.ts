import { BaseCommand, GetShapeOfCommandData } from "./BaseCommand";
import { Command } from "clipanion";

export class VersionCommand extends BaseCommand {
  @Command.Path("-v")
  @Command.Path("--version")
  public async execute() {
    const { version, name, stdout } = this.context;

    if (this.verbose) {
      stdout.write(
        `${name}: ${version}\nnode: ${process.version}\nos: ${process.platform} ${process.arch}}\n`
      );
    } else {
      stdout.write(`${version}\n`);
    }
  }
}

declare global {
  namespace NoteTools {
    interface Commands {
      "--version": GetShapeOfCommandData<VersionCommand>;
      "-v": GetShapeOfCommandData<VersionCommand>;
    }
  }
}
