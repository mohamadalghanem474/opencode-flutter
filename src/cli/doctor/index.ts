import { execSync } from "child_process"
import { existsSync, readdirSync } from "fs"
import { join, resolve, dirname } from "path"
import pc from "picocolors"
import { CONFIG_DIR, PLUGIN_VERSION } from "../../shared/index"
import { loadPluginConfig } from "../../plugin-config"

// ---------------------------------------------------------------------------
// opencode-flutter doctor — comprehensive plugin health check
// ---------------------------------------------------------------------------

// Plugin's own bundled config directory (read at runtime, never copied)
const PLUGIN_CONFIG_ROOT = resolve(
    dirname(import.meta.url.replace("file://", "")),
    "..",
    "..",
    "config",
)

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

    // ── 2. Plugin version ───────────────────────────────────────────────
    {
        checks.push({ name: "Plugin version", status: "pass", message: `v${PLUGIN_VERSION} (config hook — no file sync)` })
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

    // ── 5. Agent files (bundled in plugin package) ────────────────────────
    {
        const agentsDir = join(PLUGIN_CONFIG_ROOT, "agents")
        if (existsSync(agentsDir)) {
            const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"))
            checks.push({
                name: "Agent files",
                status: agents.length >= 10 ? "pass" : "warn",
                message: `${agents.length} agents (bundled, injected via config hook)`,
            })
        } else {
            checks.push({ name: "Agent files", status: "fail", message: "Bundled agents directory missing" })
        }
    }

    // ── 6. Command files (bundled in plugin package) ──────────────────────
    {
        const commandsDir = join(PLUGIN_CONFIG_ROOT, "commands")
        if (existsSync(commandsDir)) {
            const commands = readdirSync(commandsDir).filter((f) => f.endsWith(".md"))
            checks.push({
                name: "Command files",
                status: commands.length >= 10 ? "pass" : "warn",
                message: `${commands.length} commands (bundled, injected via config hook)`,
            })
        } else {
            checks.push({ name: "Command files", status: "fail", message: "Bundled commands directory missing" })
        }
    }

    // ── 7. Skill files (bundled in plugin package) ────────────────────────
    {
        const skillsDir = join(PLUGIN_CONFIG_ROOT, "skills")
        if (existsSync(skillsDir)) {
            const skills = readdirSync(skillsDir).filter((entry) => {
                const skillMd = join(skillsDir, entry, "SKILL.md")
                return existsSync(skillMd)
            })
            checks.push({
                name: "Skill files",
                status: skills.length >= 5 ? "pass" : "warn",
                message: `${skills.length} skills (bundled)`,
            })
        } else {
            checks.push({ name: "Skill files", status: "fail", message: "Bundled skills directory missing" })
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

    // ── 9. AGENTS.md (bundled in plugin package) ──────────────────────────
    {
        const agentsMd = join(PLUGIN_CONFIG_ROOT, "AGENTS.md")
        if (existsSync(agentsMd)) {
            checks.push({ name: "AGENTS.md", status: "pass", message: "Bundled (injected via instructions)" })
        } else {
            checks.push({ name: "AGENTS.md", status: "fail", message: "Bundled AGENTS.md missing from package" })
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
