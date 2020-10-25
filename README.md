# note-tools

A collection of my tools related to notetaking

I'm currently using Roam Research, so I'm working on a project to continously export all my notes from it, and make them usable locally.

## Available Commands

### `note-tools roam-export`

### `note-tools backup-markdown-files`

## Usage together

You can use the above two commands together with github actions to automatically backup your roam notes:

```yaml
name: "Roam Research backup"

on:
  schedule:
    - cron: "17 */1 * * *"
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

This will run at the 17th minute of every hour, and:

- export your Roam Research notes in json and markdown formats
- Download all embedded PDFs and images, and rewrite the paths to them, so you can them locallt (and on github)
  At least with images. PDF embeds are not displayed, but they're saved too!
- Commit these with the given parameters
  See `author_name` etc.
