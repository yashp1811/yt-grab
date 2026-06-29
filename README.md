# yt-grab

A tiny, dependency-free Node.js CLI that wraps [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) to download YouTube (and other supported) videos with sensible defaults.

Published to **GitHub Packages** as `@yashp1811/yt-grab`.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 16
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp#installation) on your `PATH` (or set `YT_DLP_PATH`)
- [`ffmpeg`](https://ffmpeg.org/) — required to merge best video+audio and for mp3 extraction

## Install

This package lives on the GitHub Packages npm registry. Tell npm to use that registry for the `@yashp1811` scope:

```bash
# ~/.npmrc  (or project .npmrc)
@yashp1811:registry=https://npm.pkg.github.com
```

Then install globally:

```bash
npm install -g @yashp1811/yt-grab
```

> Installing from GitHub Packages requires authenticating npm with a GitHub token
> that has the `read:packages` scope. See
> [GitHub's docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

## Usage

```bash
yt-grab <url> [options]
```

| Option | Description |
| --- | --- |
| `-o, --output <dir>` | Output directory (default: current directory) |
| `-f, --format <spec>` | `best` (default) \| `mp3` \| a max height like `720`, `1080` |
| `--audio` | Shortcut for `--format mp3` (audio only) |
| `--ffmpeg-location <p>` | Folder containing `ffmpeg`/`ffprobe` |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

### Examples

```bash
# Best quality MP4 into the current folder
yt-grab "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Cap at 1080p, save to Downloads
yt-grab "<url>" -o ~/Downloads -f 1080

# Audio only as MP3
yt-grab "<url>" --audio
```

## License

MIT
