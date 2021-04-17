import { Command, flags } from "@oclif/command";
import {
  BackupMarkdownFilesOptions,
  backupMarkdownFiles,
} from "@note-tools/backup-markdown";

export default class BackupMarkdown extends Command {
  static description =
    "Download linked images and PDFs from a folder of markdown files, and (optionally) rewrite the links.";

  static flags = {
    help: flags.help({ char: "h" }),
    input: flags.string({
      description: "The folder containing markdown files to search in",
      required: true,
    }),
    filesFolder: flags.string({
      description:
        "The output folder, where the downloaded files will be written.",
      required: true,
    }),
    replace: flags.boolean({
      description:
        "Replace the links in the files with the relative local paths",
      default: false,
    }),
  };

  async run() {
    const { flags } = this.parse(BackupMarkdown);

    const config: BackupMarkdownFilesOptions = {
      filesFolderParam: flags.filesFolder,
      mdFolderParam: flags.input,
      replace: flags.replace,
    };

    await backupMarkdownFiles(config);
  }
}
