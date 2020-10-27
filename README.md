# note-tools

A collection of my tools related to notetaking. Features include:

- Backuping up your Roam Research graphs
- Backing up embedded images and pdf from markdown files, and replacing their paths.


## Using as a Github Action

You can use the above two commands together with github actions to automatically backup your roam notes:

```yaml
name: "Roam Research backup"

on:
  schedule:
    - cron: "17 1 * * *"
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    name: Backup
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2-beta
      - name: Export from roam
        run: npx note-tools roam-export --output roamresearch/private roamresearch --email $ROAMRESEARCH_USER --password $ROAMRESEARCH_PASSWORD --graph $ROAMRESEARCH_DATABASE --formats JSON --formats Markdown --extract
        env:
          ROAMRESEARCH_USER: ${{ secrets.ROAMRESEARCH_USER }}
          ROAMRESEARCH_PASSWORD: ${{ secrets.ROAMRESEARCH_PASSWORD }}
          ROAMRESEARCH_DATABASE: ${{ secrets.ROAMRESEARCH_DATABASE }}
      - name: Download images and files
        run: npx note-tools backup-markdown-files --source roamresearch/private/markdown --files roamresearch/private/files  --output roamresearch/private/formatted
      - uses: EndBug/add-and-commit@v5
        with:
          author_name: Your name
          author_email: youremail@example.com
          message: "Automated snapshot"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This will run at 01:17, and:

- export your Roam Research notes in json and markdown formats
- Download all embedded PDFs and images, and rewrite the paths to them, so you can them locallt (and on github)
  At least with images. PDF embeds are not displayed, but they're saved too!
- Commit these with the given parameters
  See `author_name` etc.



## Usage locally

You'll need at least node version 12. To run it, just use `npx note-tools`.


## Available Commands

All commands include embedded help! Just run them without any parameters. to see, or view below.

### `note-tools roam-export`

Export your notes from Roam Research

```
Options:
  --version   Show version number                                      [boolean]
  --help      Show help                                                [boolean]
  --email     The email address of your Roam Research account.
                                                             [string] [required]
  --password  The password of your Roam Research account. Only sent to Roam.
                                                             [string] [required]
  --graph     The name of the graph you want to export       [string] [required]
  --formats     [array] [choices: "JSON", "EDN", "Markdown"] [default: ["JSON"]]
  --extract                                            [boolean] [default: true]
  --output                                                              [string]
  --debug     Open the browser instead of using a headless version.
                                                      [boolean] [default: false]
```

### `note-tools backup-markdown-files`

```
Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --source   The folder containing markdown files to search in
                                                             [string] [required]
  --files    The output folder, where the downloaded files will be written
                                                             [string] [required]
  --replace  Replace the links in the files with the relative local paths
                                                                       [boolean]
  --output   The folder where the markdown files with replaced output will be
             written. Only one of replace or output can be set.         [string]
```
