#!/usr/bin/env ts-node
/**
 * Content Repository Date Indexer
 *
 * Clones the Isaac CS content repository to a temporary directory, walks it
 * to build a map of content IDs to the date of their last git commit, then
 * deletes the temp directory. The output is consumed by generate-sitemap.ts
 * to populate accurate <lastmod> values.
 *
 * Usage:
 *   yarn index-content-dates
 *
 * Environment variables:
 *   CONTENT_DATES_OUTPUT  (optional) output path, default: scripts/content-dates.json
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

const CONTENT_REPO_URL = "git@github.com:isaaccomputerscience/isaac-content.git";

// Resolve git to its absolute path via /usr/bin/which so we never rely on PATH
const GIT_BIN = execFileSync("/usr/bin/which", ["git"], { encoding: "utf-8" }).trim();

const OUTPUT_PATH = process.env.CONTENT_DATES_OUTPUT || "scripts/content-dates.json";

/**
 * Run git log to get the ISO date of the last commit that touched a file.
 * Returns YYYY-MM-DD, or null if the file has no git history.
 */
function getLastCommitDate(repoPath: string, relativeFilePath: string): string | null {
  try {
    const iso = execFileSync(
      GIT_BIN, ["-C", repoPath, "log", "--format=%aI", "-1", "--", relativeFilePath],
      { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }
    ).trim();
    if (!iso) return null;
    return iso.split("T")[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

/**
 * Recursively collect all .json and .md files under a directory,
 * skipping hidden directories (e.g. .git).
 */
function walkDirectory(dir: string): string[] {
  const files: string[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".json" || ext === ".md") {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function main(): Promise<void> {
  console.log("=== Content Date Indexer ===\n");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "isaac-content-"));
  console.log(`Cloning ${CONTENT_REPO_URL} → ${tempDir}`);
  execFileSync(GIT_BIN, ["clone", CONTENT_REPO_URL, tempDir], { stdio: "inherit" });
  const repoPath = tempDir;

  console.log(`Content repo: ${repoPath}`);
  console.log(`Output:       ${OUTPUT_PATH}\n`);

  try {
    const allFiles = walkDirectory(repoPath);
    console.log(`Found ${allFiles.length} content files\n`);

    const dateMap: Record<string, string> = {};
    let processed = 0;
    let dated = 0;
    let skipped = 0;

    for (const filePath of allFiles) {
      const relPath = path.relative(repoPath, filePath);
      const id = path.basename(filePath, path.extname(filePath));

      if (!id) {
        skipped++;
        processed++;
        continue;
      }

      const date = getLastCommitDate(repoPath, relPath);

      if (date) {
        // On ID collision, keep the most recent date
        if (!dateMap[id] || date > dateMap[id]) {
          dateMap[id] = date;
        }
        dated++;
      } else {
        skipped++;
      }

      processed++;
      if (processed % 100 === 0) {
        process.stdout.write(`  Processed ${processed}/${allFiles.length}...\r`);
      }
    }

    // Clear the progress line
    process.stdout.write(" ".repeat(50) + "\r");

    const outputPath = path.resolve(process.cwd(), OUTPUT_PATH);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(dateMap, null, 2) + "\n", "utf-8");

    console.log(`\n=== Summary ===`);
    console.log(`Total files:   ${allFiles.length}`);
    console.log(`Dated:         ${dated}`);
    console.log(`Skipped:       ${skipped}`);
    console.log(`Unique IDs:    ${Object.keys(dateMap).length}`);
    console.log(`\nWritten to: ${outputPath}`);
  } finally {
    if (tempDir) {
      console.log(`\nCleaning up temp dir: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => { // NOSONAR typescript:S7785 — top-level await not supported in CommonJS (ts-node)
  console.error("\nFatal error:", (err as Error).message);
  process.exit(1);
});
