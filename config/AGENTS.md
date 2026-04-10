# Global Flutter Rules

These are global OpenCode rules for Flutter and Dart work.

## Default Stance

- Assume Flutter and Dart are the primary target unless the repo clearly indicates another stack.
- Optimize for large, long-context Flutter projects with multiple features, platforms, and build environments.
- Prefer existing project patterns over introducing new packages, architectures, or state-management approaches.

## Flutter Workflow

- Inspect `pubspec.yaml`, `analysis_options.yaml`, app entrypoints, `lib/`, `test/`, `integration_test/`, generated files, and available platform folders before making changes.
- Identify the repo's architecture, state management, routing, dependency injection, theming, API layer, and testing strategy before editing code.
- Preserve public APIs and feature boundaries unless the task explicitly requires a breaking change.
- Handle loading, empty, error, and success states when behavior changes.
- For UI work, ensure layouts are responsive and avoid overflow or unnecessary rebuilds.
- For platform work, explicitly account for Android, iOS, web, macOS, Windows, and Linux only when those targets exist in the repo.

## Validation

- Prefer `dart format`, `flutter analyze`, and the smallest relevant `flutter test` or `dart test` command for verification.
- When dependencies or generated code are involved, account for `flutter pub get`, build runner, flavor setup, and native configuration.
- Call out any validation you could not run.

## Output Expectations

- Be concise and implementation-focused.
- Surface architecture risk, platform caveats, and release implications when they matter.
- Prefer incremental, maintainable Flutter changes over broad rewrites.

## Flutter Commands

- Use `/flutter-help` to see the Flutter-specific OpenCode setup and choose the right agent or command.
- Use `/flutter-init` to generate or update a Flutter-focused project `AGENTS.md`.
- Use `/flutter-screen`, `/flutter-feature`, `/flutter-architecture`, `/flutter-state`, `/flutter-widget-test`, `/flutter-review`, `/flutter-perf`, `/flutter-platform`, `/flutter-release`, `/flutter-analyze`, `/flutter-debug`, `/flutter-codegen`, `/flutter-test`, and `/flutter-fix` for repeated Flutter workflows.

## Flutter Skills

- This setup is Flutter-only for skills. Prefer loading the narrowest matching `flutter-*` skill when relevant.
- Available skills: `flutter-architecture`, `flutter-state-management`, `flutter-ui-delivery`, `flutter-testing`, `flutter-performance`, `flutter-platform-release`, `flutter-codegen`.

## MCP Servers

- `context7`: Use for up-to-date Flutter and Dart library documentation. Call with a package name or API to get accurate, version-specific docs before implementing code.
- `gh_grep`: Use for searching GitHub source code via grep.app. Useful for finding real-world Flutter usage patterns, especially for lesser-known packages or edge-case configurations.

## Custom Tools

- `flutter_deps`: Runs `flutter pub outdated` and reports packages with available upgrades. Use before recommending dependency changes.
- `flutter_gen`: Runs `dart run build_runner build --delete-conflicting-outputs`. Use after modifying models, annotations, or any file that feeds code generation.
- `flutter_analyze`: Runs `dart analyze` and `dart format --set-exit-if-changed`. Returns structured errors, warnings, and unformatted files — prefer this over running analyze manually.

All three tools are provided by the `opencode-flutter` npm plugin. The plugin also provides:

- `.env` file read protection (blocks agents from reading `.env*` files)
- Flutter-aware compaction context injection (preserves architecture, deps, platform, and test state across session compactions)
- Auto-sync of agents, commands, and skills at startup

## Plugins

- `opencode-flutter`: Flutter-specific npm plugin providing agents, commands, skills, tools, and event hooks. Install via `"plugin": ["opencode-flutter"]`.
- `opencode-dynamic-context-pruning`: Automatically prunes low-value context from long sessions to stay within token budgets without losing critical project state.
- `opencode-notificator`: Sends a system notification when a long-running task completes.
- `opencode-shell-strategy`: Improves shell command planning and execution safety for multi-step bash sequences.

## Agent Roster

Primary agents (visible in session switcher):

- `build` — Lead Flutter implementation agent. Dispatches to specialist subagents.
- `plan` — Flutter planning and architecture sequencing.

Built-in agents specialized for Flutter:

- `general` — Multi-step research and implementation across feature boundaries.
- `explore` — Read-only codebase discovery and impact analysis.

Utility agents (internal):

- `compaction`, `title`, `summary` — Session management; Flutter-context-aware.

Flutter specialist subagents (hidden; dispatched automatically by `build` or `general`):

- `flutter-architect` — Module boundaries, migrations, navigation structure.
- `flutter-ui-builder` — Widgets, screens, responsive layouts, theming.
- `flutter-state-data` — State management, repositories, services, async flows.
- `flutter-platform-integrator` — Android, iOS, web, desktop, plugins, native config.
- `flutter-performance` — Rebuilds, rendering, startup, memory, scroll jank.
- `flutter-release-manager` — Flavors, signing, CI, store readiness.
- `flutter-qa` — Tests, analysis, regressions, performance validation.
- `flutter-reviewer` — Final bug, regression, and lifecycle review pass.
