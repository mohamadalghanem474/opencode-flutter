import { existsSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import pc from "picocolors"

// ---------------------------------------------------------------------------
// opencode-flutter init — initialize plugin config for a project
// ---------------------------------------------------------------------------

interface InitOptions {
    force: boolean
}

const DEFAULT_CONFIG = `{
  // opencode-flutter plugin configuration
  // Docs: https://github.com/alghanem/opencode-flutter
  "$schema": "./node_modules/opencode-flutter/dist/opencode-flutter.schema.json",

  // Per-agent model/temperature overrides
  "agents": {
    // "build": { "model": "anthropic/claude-opus-4-6" },
    // "flutter-architect": { "fallback_models": ["openai/gpt-5.4"] }
  },

  // Category-based task delegation overrides
  "categories": {
    // "flutter-ui": { "model": "google/gemini-3.1-pro", "temperature": 0.3 }
  },

  // Disable specific hooks, tools, skills, or commands
  "disabled_hooks": [],
  "disabled_tools": [],
  "disabled_skills": [],
  "disabled_commands": [],

  // Feature flags
  "experimental": {
    "task_system": false,
    "safe_hook_creation": true
  },

  // Background agent concurrency
  "background": {
    "max_concurrent": 5
  },

  // Runtime model fallback
  "runtime_fallback": {
    "enabled": true,
    "max_retries": 3,
    "cooldown_ms": 30000
  }
}
`

export async function runInit(opts: InitOptions): Promise<void> {
    const projectDir = join(process.cwd(), ".opencode")
    const configPath = join(projectDir, "opencode-flutter.jsonc")

    if (existsSync(configPath) && !opts.force) {
        console.log(pc.yellow(`Config already exists: ${configPath}`))
        console.log(pc.dim("Use --force to overwrite"))
        return
    }

    mkdirSync(projectDir, { recursive: true })
    writeFileSync(configPath, DEFAULT_CONFIG, "utf-8")
    console.log(pc.green(`Created: ${configPath}`))
    console.log(pc.dim("Edit this file to customize agent models, categories, and plugin behavior."))
}
