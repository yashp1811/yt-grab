#!/usr/bin/env node
"use strict";

/**
 * yt-grab — a tiny, dependency-free wrapper around yt-dlp.
 *
 * Usage:
 *   yt-grab <url> [options]
 *
 * Options:
 *   -o, --output <dir>        Output directory (default: current directory)
 *   -f, --format <spec>       best (default) | mp3 | <height> e.g. 720, 1080
 *       --audio               Shortcut for --format mp3 (audio only)
 *       --ffmpeg-location <p> Path to a folder containing ffmpeg/ffprobe
 *   -h, --help                Show this help
 *   -v, --version             Show version
 *
 * Requires yt-dlp on PATH (or set YT_DLP_PATH). ffmpeg is needed for merging
 * best video+audio and for mp3 extraction.
 */

const { spawn, spawnSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");
const os = require("os");

const pkg = require(path.join(__dirname, "..", "package.json"));

function printHelp() {
  console.log(`yt-grab v${pkg.version} — download videos via yt-dlp

Usage:
  yt-grab <url> [options]

Options:
  -o, --output <dir>        Output directory (default: current directory)
  -f, --format <spec>       best (default) | mp3 | <height> e.g. 720, 1080
      --audio               Shortcut for --format mp3 (audio only)
      --ffmpeg-location <p> Folder containing ffmpeg/ffprobe binaries
  -h, --help                Show this help
  -v, --version             Show version

Examples:
  yt-grab "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  yt-grab <url> -o ~/Downloads -f 1080
  yt-grab <url> --audio
`);
}

function parseArgs(argv) {
  const opts = { url: null, output: process.cwd(), format: "best", ffmpeg: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "-v":
      case "--version":
        console.log(pkg.version);
        process.exit(0);
        break;
      case "-o":
      case "--output":
        opts.output = argv[++i];
        break;
      case "-f":
      case "--format":
        opts.format = argv[++i];
        break;
      case "--audio":
        opts.format = "mp3";
        break;
      case "--ffmpeg-location":
        opts.ffmpeg = argv[++i];
        break;
      default:
        if (a.startsWith("-")) {
          console.error(`Unknown option: ${a}`);
          process.exit(2);
        }
        if (!opts.url) opts.url = a;
        break;
    }
  }
  return opts;
}

// Locate yt-dlp: env override -> PATH -> common Windows winget link path.
function findYtDlp() {
  if (process.env.YT_DLP_PATH && existsSync(process.env.YT_DLP_PATH)) {
    return process.env.YT_DLP_PATH;
  }
  const bin = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const probe = spawnSync(bin, ["--version"], { stdio: "ignore", shell: false });
  if (probe.status === 0) return bin;

  if (process.platform === "win32") {
    const candidates = [
      path.join(os.homedir(), "AppData", "Local", "Microsoft", "WinGet", "Links", "yt-dlp.exe"),
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
  }
  return null;
}

function buildArgs(opts) {
  const args = [];
  const fmt = String(opts.format).toLowerCase();

  if (fmt === "mp3" || fmt === "audio") {
    args.push("-x", "--audio-format", "mp3");
  } else if (/^\d+$/.test(fmt)) {
    args.push("-f", `bv*[height<=${fmt}]+ba/b[height<=${fmt}]`, "--merge-output-format", "mp4");
  } else {
    // best
    args.push("-f", "bv*+ba/b", "--merge-output-format", "mp4");
  }

  if (opts.ffmpeg) args.push("--ffmpeg-location", opts.ffmpeg);

  const template = path.join(opts.output, "%(title)s [%(id)s].%(ext)s");
  args.push("-o", template);
  args.push(opts.url);
  return args;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.url) {
    printHelp();
    process.exit(opts ? 1 : 0);
  }

  const ytdlp = findYtDlp();
  if (!ytdlp) {
    console.error(
      "yt-grab: could not find yt-dlp.\n" +
        "Install it (https://github.com/yt-dlp/yt-dlp#installation) or set YT_DLP_PATH " +
        "to the full path of the yt-dlp executable."
    );
    process.exit(127);
  }

  const args = buildArgs(opts);
  console.log(`yt-grab: running yt-dlp -> ${opts.output} (format: ${opts.format})`);
  const child = spawn(ytdlp, args, { stdio: "inherit", shell: false });
  child.on("error", (err) => {
    console.error(`yt-grab: failed to launch yt-dlp: ${err.message}`);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code == null ? 1 : code));
}

main();
