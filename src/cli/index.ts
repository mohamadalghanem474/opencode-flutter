#!/usr/bin/env node
import { Command } from "commander"
import pc from "picocolors"
import { PLUGIN_NAME, PLUGIN_VERSION } from "../shared/index"
import { runDoctor } from "./doctor/index"

const program = new Command()

program
    .name(PLUGIN_NAME)
    .description("OpenCode Flutter plugin CLI — diagnostics, setup, and management")
    .version(PLUGIN_VERSION, "-v, --version")

// ── doctor ─────────────────────────────────────────────────────────────────

program
    .command("doctor")
    .description("Check plugin health: config, Flutter SDK, agents, hooks, MCP connectivity")
    .option("--verbose", "Show detailed output for each check", false)
    .action(async (opts) => {
        console.log(pc.bold(`\n${PLUGIN_NAME} doctor (v${PLUGIN_VERSION})\n`))
        await runDoctor({ verbose: opts.verbose })
    })

// ── install ────────────────────────────────────────────────────────────────

program
    .command("install")
    .description("Install and configure opencode-flutter: register plugin, merge defaults, sync files")
    .option("--no-tui", "Non-interactive mode (for LLM agents)", false)
    .option("--force", "Overwrite existing project config", false)
    .action(async (opts) => {
        const { runInstall } = await import("./install/index")
        await runInstall({ noTui: !opts.tui, force: opts.force })
    })

// ── init ───────────────────────────────────────────────────────────────────

program
    .command("init")
    .description("Initialize opencode-flutter config for the current project")
    .option("--force", "Overwrite existing config", false)
    .action(async (opts) => {
        const { runInit } = await import("./init/index")
        await runInit({ force: opts.force })
    })

program.parse()
