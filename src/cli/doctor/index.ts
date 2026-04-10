import { execSync } from "child_process"
import { existsSync, readdirSync } from "fs"
import { join } from "path"
import pc from "picocolors"
import { CONFIG_DIR, PLUGIN_VERSION, readInstalledVersion } from "../../shared/index"
import { loadPluginConfig } from "../../plugin-config"

// ---------------------------------------------------------------------------
// opencode-flutter doctor — comprehensive plugin health check
// ---------------------------------------------------------------------------

interface DoctorOptions {
    verbose: boolean
}

interface CheckResult {
    name: string
    status: "pass" | "warn" | "fail"
    message: string
    detail?: string
}

const MIN_OPENCODE_VERSION = "1.4.0"

function compareVersions(a: string, b: string): number {
    const pa = a.split(".").map(Number)
    const pb = b.split(".").map(Number)
    for (let i = 0; i < 3; i++) {
        if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1
        if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1
    }
    return 0
}

function tryExec(cmd: string): { ok: boolean; stdout: string; stderr: string } {
    try {
        const stdout = execSync(cmd, { encoding: "utf-8", timeout: 15000, stdio: ["pipe", "pipe", "pipe"] }).trim()
        return { ok: true, stdout, stderr: "" }
    } catch (err: any) {
        return { ok: false, stdout: "", stderr: err.stderr?.toString?.() ?? err.message ?? "" }
    }
}

export async function runDoctor(opts: DoctorOptions): Promise<void> {
    const checks: CheckResult[] = []

    // ── 1. OpenCode version ────────────────────────────────────────────────
    {
        const result = tryExec("opencode --version")
        if (result.ok) {
            const version = result.stdout.replace(/^v/, "").trim()
            if (compareVersions(version, MIN_OPENCODE_VERSION) >= 0) {
                checks.push({ name: "OpenCode version", status: "pass", message: `v${version}` })
            } else {
                checks.push({
                    name: "OpenCode version",
                    status: "warn",
                    message: `v${version} (minimum: v${MIN_OPENCODE_VERSION})`,
                })
            }
        } else {
            checks.push({ name: "OpenCode version", status: "fail", message: "opencode not found in PATH" })
        }
    }

    // ── 2. Plugin version & sync ──────────────────────────────────────────
    {
        const installed = readInstalledVersion()
        if (installed === PLUGIN_VERSION) {
            checks.push({ name: "Plugin sync", status: "pass", message: `v${PLUGIN_VERSION} (synced)` })
        } else if (installed) {
            checks.push({
                name: "Plugin sync",
                status: "warn",
                message: `Synced: v${installed}, current: v${PLUGIN_VERSION}. Restart OpenCode to update.`,
            })
        } else {
            checks.push({
                name: "Plugin sync",
                status: "warn",
                message: "Not yet synced. Start OpenCode to trigger first-run sync.",
            })
        }
    }

    // ── 3. Flutter SDK ─────────────────────────────────────────────────────
    {
        const result = tryExec("flutter --version")
        if (result.ok) {
            const match = result.stdout.match(/Flutter\s+([\d.]+)/)
            checks.push({ name: "Flutter SDK", status: "pass", message: match ? `v${match[1]}` : "found" })
        } else {
            checks.push({ name: "Flutter SDK", status: "fail", message: "flutter not found in PATH" })
        }
    }

    // ── 4. Dart SDK ────────────────────────────────────────────────────────
    {
        const result = tryExec("dart --version")
        if (result.ok) {
            const match = result.stdout.match(/Dart SDK version:\s*([\d.]+)/) ?? result.stderr.match(/Dart SDK version:\s*([\d.]+)/)
            checks.push({ name: "Dart SDK", status: "pass", message: match ? `v${match[1]}` : "found" })
        } else {
            checks.push({ name: "Dart SDK", status: "fail", message: "dart not found in PATH" })
        }
    }

    // ── 5. Agent files ─────────────────────────────────────────────────────
    {
        const agentsDir = join(CONFIG_DIR, "agents")
        if (existsSync(agentsDir)) {
            const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"))
            checks.push({
                name: "Agent files",
                status: agents.length >= 10 ? "pass" : "warn",
                message: `${agents.length} agents in ${agentsDir}`,
            })
        } else {
            checks.push({ name: "Agent files", status: "fail", message: "No agents directory found" })
        }
    }

    // ── 6. Command files ──────────────────────────────────────────────────
    {
        const commandsDir = join(CONFIG_DIR, "commands")
        if (existsSync(commandsDir)) {
            const commands = readdirSync(commandsDir).filter((f) => f.endsWith(".md"))
            checks.push({
                name: "Command files",
                status: commands.length >= 10 ? "pass" : "warn",
                message: `${commands.length} commands in ${commandsDir}`,
            })
        } else {
            checks.push({ name: "Command files", status: "fail", message: "No commands directory found" })
        }
    }

    // ── 7. Skill files ────────────────────────────────────────────────────
    {
        const skillsDir = join(CONFIG_DIR, "skills")
        if (existsSync(skillsDir)) {
            const skills = readdirSync(skillsDir).filter((entry) => {
                const skillMd = join(skillsDir, entry, "SKILL.md")
                return existsSync(skillMd)
            })
            checks.push({
                name: "Skill files",
                status: skills.length >= 5 ? "pass" : "warn",
                message: `${skills.length} skills in ${skillsDir}`,
            })
        } else {
            checks.push({ name: "Skill files", status: "fail", message: "No skills directory found" })
        }
    }

    // ── 8. Plugin config ──────────────────────────────────────────────────
    {
        try {
            const config = loadPluginConfig(process.cwd())
            const disabledCount =
                config.disabled_hooks.length +
                config.disabled_tools.length +
                config.disabled_skills.length
            checks.push({
                name: "Plugin config",
                status: "pass",
                message: `Valid${disabledCount > 0 ? ` (${disabledCount} items disabled)` : ""}`,
            })
        } catch (err) {
            checks.push({
                name: "Plugin config",
                status: "warn",
                message: `Using defaults: ${err}`,
            })
        }
    }

    // ── 9. AGENTS.md ──────────────────────────────────────────────────────
    {
        const agentsMd = join(CONFIG_DIR, "AGENTS.md")
        if (existsSync(agentsMd)) {
            checks.push({ name: "AGENTS.md", status: "pass", message: "Present" })
        } else {
            checks.push({ name: "AGENTS.md", status: "warn", message: "Not found — will be created on first sync" })
        }
    }

    // ── Print results ─────────────────────────────────────────────────────
    let passCount = 0
    let warnCount = 0
    let failCount = 0

    for (const check of checks) {
        const icon =
            check.status === "pass" ? pc.green("✓") :
                check.status === "warn" ? pc.yellow("!") :
                    pc.red("✗")
        const msg =
            check.status === "pass" ? check.message :
                check.status === "warn" ? pc.yellow(check.message) :
                    pc.red(check.message)

        console.log(`  ${icon} ${check.name}: ${msg}`)
        if (opts.verbose && check.detail) {
            console.log(`    ${pc.dim(check.detail)}`)
        }

        if (check.status === "pass") passCount++
        else if (check.status === "warn") warnCount++
        else failCount++
    }

    console.log()
    if (failCount > 0) {
        console.log(pc.red(`  ${failCount} issue(s) found. Fix them for best results.`))
    } else if (warnCount > 0) {
        console.log(pc.yellow(`  ${warnCount} warning(s). Plugin will work, but check the warnings.`))
    } else {
        console.log(pc.green("  All checks passed. Flutter plugin is healthy."))
    }
    console.log()
}
