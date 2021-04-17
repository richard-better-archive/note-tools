# note-tools

A collection of my tools related to digital gardening.

## @note-tools/cli

A cli that for

- Backing up your Roam Research graphs
- Backing up embedded images and pdf from markdown files, and replacing their paths.

install with

```bash
npm install -g @note-tools/cli
```

after that you can use it with `note-tools`. For usage instructions, see the dedicated [readme](https://github.com/rbrcsk/note-tools/blob/roam-to-obsidian/packages/cli/README.md).

## Usage as Github Actions

You can utilize the cli to automatically back up your Roam Research graph to a github repository.

See this example configuration:

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
        run: npx @note-tools/cli roam-export --output roamresearch/private roamresearch --email $ROAMRESEARCH_USER --password $ROAMRESEARCH_PASSWORD --graph $ROAMRESEARCH_DATABASE --formats JSON --formats Markdown --extract
        env:
          ROAMRESEARCH_USER: ${{ secrets.ROAMRESEARCH_USER }}
          ROAMRESEARCH_PASSWORD: ${{ secrets.ROAMRESEARCH_PASSWORD }}
          ROAMRESEARCH_DATABASE: ${{ secrets.ROAMRESEARCH_DATABASE }}
      - name: Download images and files
        run: npx @note-tools/cli backup-markdown --input roamresearch/private/markdown --filesFolder roamresearch/private/files  --replace
      - uses: EndBug/add-and-commit@v5
        with:
          author_name: Your name
          author_email: youremail@example.com
          message: "Automated snapshot"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
