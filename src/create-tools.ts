import { tool } from "@opencode-ai/plugin"
import type { OpenCodeFlutterConfig, CategoryConfig } from "./config/index"
import { DEFAULT_CATEGORIES } from "./config/defaults"
import type { Managers } from "./create-managers"

// ---------------------------------------------------------------------------
// Tool registry factory — creates all plugin tools, filters by disabled_tools
// ---------------------------------------------------------------------------

export interface PluginContext {
    directory: string
    client: any
    $: any // shell executor from @opencode-ai/plugin
}

export interface AvailableCategory {
    name: string
    config: CategoryConfig
}

export interface CreateToolsResult {
    filteredTools: Record<string, unknown>
    availableCategories: AvailableCategory[]
    taskSystemEnabled: boolean
}

interface CreateToolsDeps {
    ctx: PluginContext
    pluginConfig: OpenCodeFlutterConfig
    managers: Managers
}

/** Build the complete tool registry, filtering out disabled tools */
export function createTools(deps: CreateToolsDeps): CreateToolsResult {
    const { ctx, pluginConfig, managers } = deps
    const disabled = new Set(pluginConfig.disabled_tools)

    // ── Resolve available categories ─────────────────────────────────────────
    const mergedCategories = { ...DEFAULT_CATEGORIES }
    for (const [name, override] of Object.entries(pluginConfig.categories)) {
        mergedCategories[name] = { ...mergedCategories[name], ...override }
    }
    const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(
        ([name, config]) => ({ name, config }),
    )

    // ── Flutter tools ────────────────────────────────────────────────────────

    const allTools: Record<string, unknown> = {}

    allTools.flutter_deps = tool({
        description:
            "Check Flutter/Dart package dependency status. Runs `flutter pub outdated` and `flutter pub deps` to surface outdated packages, resolution conflicts, and transitive dependency trees.",
        args: {
            projectPath: tool.schema
                .string()
                .optional()
                .describe("Absolute path to the Flutter project directory. Defaults to the current working directory."),
            outdatedOnly: tool.schema
                .boolean()
                .optional()
                .default(true)
                .describe("When true, only returns packages with available upgrades."),
        },
        async execute(args, context) {
            const cwd = args.projectPath ?? context.directory
            const $ = ctx.$

            const outdatedResult = await $`flutter pub outdated --json`.cwd(cwd).quiet().nothrow()
            let outdatedData: unknown = null
            if (outdatedResult.exitCode === 0) {
                try {
                    outdatedData = JSON.parse(outdatedResult.stdout.toString())
                } catch {
                    outdatedData = outdatedResult.stdout.toString()
                }
            }

            const depsResult = await $`flutter pub deps`.cwd(cwd).quiet().nothrow()

            const summary: Record<string, unknown> = {
                projectPath: cwd,
                outdated: outdatedData,
                depsTree: depsResult.exitCode === 0 ? depsResult.stdout.toString() : null,
                errors: [] as string[],
            }

            if (outdatedResult.exitCode !== 0) {
                ; (summary.errors as string[]).push(
                    `flutter pub outdated failed: ${outdatedResult.stderr.toString()}`,
                )
            }
            if (depsResult.exitCode !== 0) {
                ; (summary.errors as string[]).push(
                    `flutter pub deps failed: ${depsResult.stderr.toString()}`,
                )
            }

            if (
                args.outdatedOnly &&
                outdatedData &&
                typeof outdatedData === "object" &&
                "packages" in outdatedData
            ) {
                const pkgs = (outdatedData as { packages: unknown[] }).packages
                summary.outdated = pkgs.filter((p: unknown) => {
                    const pkg = p as Record<string, Record<string, string>>
                    return (
                        pkg.current?.version !== pkg.upgradable?.version &&
                        pkg.upgradable?.version != null
                    )
                })
            }

            return JSON.stringify(summary)
        },
    })

    allTools.flutter_gen = tool({
        description:
            "Run code generation for a Flutter project using `dart run build_runner build --delete-conflicting-outputs`. Handles freezed, json_serializable, riverpod_generator, injectable, and other build_runner-based generators.",
        args: {
            projectPath: tool.schema
                .string()
                .optional()
                .describe("Absolute path to the Flutter project directory. Defaults to the current working directory."),
            deleteConflicting: tool.schema
                .boolean()
                .optional()
                .default(true)
                .describe("Pass --delete-conflicting-outputs to build_runner to auto-resolve conflicts."),
        },
        async execute(args, context) {
            const cwd = args.projectPath ?? context.directory
            const $ = ctx.$

            const pubGetResult = await $`flutter pub get`.cwd(cwd).quiet().nothrow()
            if (pubGetResult.exitCode !== 0) {
                return JSON.stringify({
                    success: false,
                    stage: "pub_get",
                    error: pubGetResult.stderr.toString(),
                    stdout: pubGetResult.stdout.toString(),
                })
            }

            const deleteFlag = args.deleteConflicting ? "--delete-conflicting-outputs" : ""
            const buildResult = await $`dart run build_runner build ${deleteFlag}`
                .cwd(cwd)
                .quiet()
                .nothrow()
            const stdout = buildResult.stdout.toString()
            const stderr = buildResult.stderr.toString()
            const exitCode = buildResult.exitCode

            const generated: string[] = []
            const skipped: string[] = []
            for (const line of stdout.split("\n")) {
                if ((line as string).includes("[FINE]") && (line as string).includes("Writing")) {
                    generated.push((line as string).replace(/.*Writing\s+/, "").trim())
                } else if ((line as string).includes("[FINE]") && (line as string).includes("Skipping")) {
                    skipped.push((line as string).replace(/.*Skipping\s+/, "").trim())
                }
            }

            return JSON.stringify({
                success: exitCode === 0,
                stage: "build_runner",
                generatedFiles: generated,
                skippedFiles: skipped,
                stdout,
                ...(exitCode !== 0 ? { error: stderr } : {}),
            })
        },
    })

    allTools.flutter_analyze = tool({
        description:
            "Runs `dart analyze` and `dart format --set-exit-if-changed` on a Flutter project. Returns structured errors, warnings, and format violations so agents can act on them directly.",
        args: {
            projectPath: tool.schema
                .string()
                .optional()
                .describe("Absolute path to the Flutter project directory. Defaults to the current working directory."),
            fix: tool.schema
                .boolean()
                .optional()
                .default(false)
                .describe("When true, also runs `dart fix --apply` before analyzing to auto-apply lint fixes."),
        },
        async execute(args, context) {
            const cwd = args.projectPath ?? context.directory
            const $ = ctx.$
            const results: Record<string, unknown> = { projectPath: cwd }

            if (args.fix) {
                const fixResult = await $`dart fix --apply`.cwd(cwd).quiet().nothrow()
                results.dartFix = {
                    exitCode: fixResult.exitCode,
                    stdout: fixResult.stdout.toString(),
                    stderr: fixResult.stderr.toString(),
                }
            }

            const analyzeResult = await $`dart analyze --format=json`.cwd(cwd).quiet().nothrow()
            let analyzeData: unknown = null
            try {
                analyzeData = JSON.parse(analyzeResult.stdout.toString())
            } catch {
                analyzeData = analyzeResult.stdout.toString()
            }

            const diagnostics = Array.isArray(
                (analyzeData as { diagnostics?: unknown[] })?.diagnostics,
            )
                ? (analyzeData as { diagnostics: unknown[] }).diagnostics
                : []

            const errors = diagnostics.filter(
                (d) => (d as { severity: string }).severity === "ERROR",
            )
            const warnings = diagnostics.filter(
                (d) => (d as { severity: string }).severity === "WARNING",
            )
            const infos = diagnostics.filter(
                (d) => (d as { severity: string }).severity === "INFO",
            )

            results.analyze = {
                exitCode: analyzeResult.exitCode,
                errorCount: errors.length,
                warningCount: warnings.length,
                infoCount: infos.length,
                errors,
                warnings,
                infos,
            }

            const formatResult = await $`dart format --set-exit-if-changed --output=none .`
                .cwd(cwd)
                .quiet()
                .nothrow()
            const formatOutput = formatResult.stdout.toString()
            const unformatted = formatOutput
                .split("\n")
                .filter((l: string) => l.startsWith("Changed ") || l.startsWith("Formatted "))
                .map((l: string) => l.replace(/^(Changed|Formatted)\s+/, "").trim())
                .filter(Boolean)

            results.format = {
                clean: formatResult.exitCode === 0,
                unformattedFiles: unformatted,
                output: formatOutput,
            }

            return JSON.stringify(results)
        },
    })

    allTools.flutter_test = tool({
        description:
            "Run Flutter tests with structured output. Supports targeting specific test files/directories and reporting coverage.",
        args: {
            projectPath: tool.schema
                .string()
                .optional()
                .describe("Absolute path to the Flutter project directory."),
            target: tool.schema
                .string()
                .optional()
                .describe("Specific test file or directory to run. Defaults to all tests."),
            coverage: tool.schema
                .boolean()
                .optional()
                .default(false)
                .describe("When true, generates coverage report."),
        },
        async execute(args, context) {
            const cwd = args.projectPath ?? context.directory
            const $ = ctx.$

            const coverageFlag = args.coverage ? "--coverage" : ""
            const targetArg = args.target ?? ""
            const testResult = await $`flutter test ${coverageFlag} ${targetArg} --reporter=json`
                .cwd(cwd)
                .quiet()
                .nothrow()

            const stdout = testResult.stdout.toString()
            const stderr = testResult.stderr.toString()
            let testEvents: unknown[] = []
            try {
                testEvents = stdout
                    .split("\n")
                    .filter(Boolean)
                    .map((line: string) => JSON.parse(line))
            } catch {
                // Fall back to raw output
            }

            const passed = testEvents.filter(
                (e: any) => e.type === "testDone" && e.result === "success",
            ).length
            const failed = testEvents.filter(
                (e: any) => e.type === "testDone" && e.result === "failure",
            ).length
            const skipped = testEvents.filter(
                (e: any) => e.type === "testDone" && e.skipped === true,
            ).length

            return JSON.stringify({
                success: testResult.exitCode === 0,
                passed,
                failed,
                skipped,
                total: passed + failed + skipped,
                stdout: testEvents.length === 0 ? stdout : undefined,
                stderr: testResult.exitCode !== 0 ? stderr : undefined,
            })
        },
    })

    allTools.flutter_build = tool({
        description:
            "Build a Flutter project for a specific platform. Reports structured build errors.",
        args: {
            projectPath: tool.schema
                .string()
                .optional()
                .describe("Absolute path to the Flutter project directory."),
            platform: tool.schema
                .string()
                .describe("Target platform: apk, appbundle, ios, web, macos, windows, linux"),
            flavor: tool.schema
                .string()
                .optional()
                .describe("Build flavor/scheme to use."),
            release: tool.schema
                .boolean()
                .optional()
                .default(false)
                .describe("Build in release mode."),
        },
        async execute(args, context) {
            const cwd = args.projectPath ?? context.directory
            const $ = ctx.$

            const modeFlag = args.release ? "--release" : "--debug"
            const flavorFlag = args.flavor ? `--flavor ${args.flavor}` : ""
            const buildResult = await $`flutter build ${args.platform} ${modeFlag} ${flavorFlag}`
                .cwd(cwd)
                .quiet()
                .nothrow()

            return JSON.stringify({
                success: buildResult.exitCode === 0,
                platform: args.platform,
                mode: args.release ? "release" : "debug",
                flavor: args.flavor ?? null,
                stdout: buildResult.stdout.toString(),
                ...(buildResult.exitCode !== 0 ? { error: buildResult.stderr.toString() } : {}),
            })
        },
    })

    // ── Delegation tools ─────────────────────────────────────────────────────

    allTools.call_flutter_agent = tool({
        description:
            "Spawn a specialized Flutter subagent for delegation. Picks the right agent based on the task domain. Supports background execution.",
        args: {
            agent: tool.schema
                .string()
                .describe(
                    "Which agent to invoke: flutter-architect, flutter-ui-builder, flutter-state-data, flutter-platform-integrator, flutter-performance, flutter-qa, flutter-reviewer, flutter-release-manager, explore, general",
                ),
            prompt: tool.schema.string().describe("Detailed task prompt for the agent."),
            run_in_background: tool.schema
                .boolean()
                .optional()
                .default(false)
                .describe("Run the agent as a background task."),
        },
        async execute(args) {
            if (args.run_in_background && managers.backgroundManager) {
                const taskId = managers.backgroundManager.enqueue({
                    agent: args.agent,
                    prompt: args.prompt,
                })
                return JSON.stringify({
                    status: "background",
                    taskId,
                    message: `Agent ${args.agent} started in background. Use background_output(taskId="${taskId}") to retrieve results.`,
                })
            }
            // Foreground: return delegation instruction for OpenCode runtime
            return JSON.stringify({
                status: "delegate",
                agent: args.agent,
                prompt: args.prompt,
            })
        },
    })

    allTools.task = tool({
        description:
            "Category-based task delegation. Spawns an executor agent tuned for the task domain with the correct model and temperature. The executor cannot re-delegate tasks.",
        args: {
            category: tool.schema
                .string()
                .optional()
                .describe(
                    `Task category for model selection: ${availableCategories.map((c) => c.name).join(", ")}`,
                ),
            prompt: tool.schema.string().describe("Detailed task description."),
            load_skills: tool.schema
                .array(tool.schema.string())
                .optional()
                .default([])
                .describe("Skills to load for this task."),
            run_in_background: tool.schema
                .boolean()
                .optional()
                .default(false)
                .describe("Execute as background task."),
        },
        async execute(args) {
            const categoryConfig = mergedCategories[args.category ?? "flutter-quick"]
            return JSON.stringify({
                status: args.run_in_background ? "background" : "delegate",
                category: args.category ?? "flutter-quick",
                model: categoryConfig?.model,
                temperature: categoryConfig?.temperature,
                prompt: args.prompt,
                skills: args.load_skills,
            })
        },
    })

    allTools.background_output = tool({
        description: "Retrieve results from a completed background agent task.",
        args: {
            taskId: tool.schema.string().describe("The task ID returned by a background delegation."),
        },
        async execute(args) {
            if (!managers.backgroundManager) {
                return JSON.stringify({ error: "Background manager not available." })
            }
            return JSON.stringify(managers.backgroundManager.getResult(args.taskId))
        },
    })

    allTools.background_cancel = tool({
        description: "Cancel a running background agent task.",
        args: {
            taskId: tool.schema.string().describe("The task ID to cancel."),
        },
        async execute(args) {
            if (!managers.backgroundManager) {
                return JSON.stringify({ error: "Background manager not available." })
            }
            return JSON.stringify(managers.backgroundManager.cancel(args.taskId))
        },
    })

    // ── Filter disabled tools ────────────────────────────────────────────────

    const filteredTools: Record<string, unknown> = {}
    for (const [name, def] of Object.entries(allTools)) {
        if (!disabled.has(name)) {
            filteredTools[name] = def
        }
    }

    return {
        filteredTools,
        availableCategories,
        taskSystemEnabled: pluginConfig.experimental.task_system,
    }
}
