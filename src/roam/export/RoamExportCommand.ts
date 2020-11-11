import { BaseCommand } from "../../common";
import type { CommandString, GetShapeOfCommandData } from "../../common";

export class RoamExportCommand extends BaseCommand {
  // public static usage = BaseCommand.Usage({
  //   description: "Bundle a remirror editor for use within a webview.",
  //   category: "Bundle",
  //   details: `
  //     Bundle your editor.
  //   `,
  //   examples: [
  //     [
  //       "Quickly create a new monorepo project called awesome with all the default options",
  //       "$0 bundle src/index.ts",
  //     ],
  //     [
  //       "Bundle an editor from an npm package. Make sure the editor supports being used within a webview. Not all of them do.",
  //       "$0 create @remirror/react-social",
  //     ],
  //   ],
  // });

  /**
   * The email address of your Roam Research account.
   */
  @BaseCommand.String("--email")
  public email: CommandString = "";

  /**
   * The password of your Roam Research account. Only sent to Roam.
   */
  @BaseCommand.String("--password")
  public password: CommandString = "";

  /**
   * The name of the graph you want to export.
   */
  @BaseCommand.String("--graph")
  public graph: CommandString = "";

  /**
   * The name of the graph you want to export.
   */
  @BaseCommand.Array("--formats", {
    description:
      "JSON, EDN or Markdown. To get multiple formats, specify the command multiple times.",
  })
  public formats: string[] = ["json", "edn"];

  @BaseCommand.Path("roam-export")
  @BaseCommand.Path("roam export")
  public async execute() {
    console.log("roam export run!!!");
    console.log({ formats: this.formats });
  }
}

declare global {
  namespace NoteTools {
    interface Commands {
      "roam export": GetShapeOfCommandData<RoamExportCommand>;
      "roam-export": GetShapeOfCommandData<RoamExportCommand>;
    }
  }
}
