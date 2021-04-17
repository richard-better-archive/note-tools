import { Command, flags } from "@oclif/command";
import {
  RoamExportOptions,
  runRoamExport,
  supportedExportFormats,
  validatedFormats,
} from "@note-tools/roam-export";

export default class RoamExport extends Command {
  static description = "Export your Roam Research graphs in multiple formats.";

  static flags = {
    help: flags.help({ char: "h" }),
    email: flags.string({
      description: "The email address of your Roam Research account.",
      required: true,
    }),
    password: flags.string({
      description:
        "The password of your Roam Research account. Only sent to Roam.",
      required: true,
    }),
    graph: flags.string({
      description: "The name of the graph you want to export.",
      required: true,
    }),
    formats: flags.string({
      options: supportedExportFormats,
      default: ["EDN"],
      multiple: true,
    }),
    extract: flags.boolean({
      description: "Enable to extract the downloaded zip files",
      default: false,
    }),
    output: flags.string({
      description:
        "The folder to store downloaded items in. Defaults to ./graph-name",
    }),
    debug: flags.boolean({ default: false }),
  };

  async run() {
    const { flags } = this.parse(RoamExport);

    const exportOptions: RoamExportOptions = {
      email: flags.email,
      password: flags.password,
      graph: flags.graph,
      formats: validatedFormats(flags.formats),
      debug: flags.debug,
      extract: flags.extract,
      output: flags.output ?? `${__dirname}/${flags.graph}`,
    };

    console.log(flags);

    await runRoamExport(exportOptions);
  }
}
