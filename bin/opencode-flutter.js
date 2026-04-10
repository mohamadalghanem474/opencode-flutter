#!/usr/bin/env node

// ---------------------------------------------------------------------------
// opencode-flutter CLI bin — routes to compiled CLI entry
// ---------------------------------------------------------------------------

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, "..", "dist", "cli", "index.js");

try {
  await import(cliPath);
} catch (err) {
  console.error(
    "opencode-flutter: CLI not built. Run `bun run build` first.",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}
