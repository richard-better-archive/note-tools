import { BaseCommand, GetShapeOfCommandData } from "./BaseCommand";
import { Command } from "clipanion";

export class HelpCommand extends BaseCommand {
  @Command.Path("-h")
  @Command.Path("--help")
  public async execute() {
    this.context.stdout.write(this.cli.usage(null, { detailed: this.verbose }));
  }
}

declare global {
  namespace NoteTools {
    interface Commands {
      "--help": GetShapeOfCommandData<HelpCommand>;
      "-h": GetShapeOfCommandData<HelpCommand>;
    }
  }
}
