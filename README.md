# opencode-flutter

OpenCode plugin for Flutter-only workflows. Provides a complete Flutter development environment with specialized agents, commands, skills, tools, and hooks.

## Install

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-flutter"]
}
```

On first startup, the plugin will:

1. Sync 15 Flutter agents, 16 commands, and 7 skills to `~/.config/opencode/`
2. Merge Flutter defaults (formatter, LSP, MCP, permissions, watcher) into your `opencode.json`
3. Register 3 custom tools and 2 event hooks

**Restart OpenCode after first install** to activate agents and commands.

## What's Included

### Agents (15)

| Agent                         | Mode     | Model          | Purpose                                |
| ----------------------------- | -------- | -------------- | -------------------------------------- |
| `build`                       | primary  | gemini-3.1-pro | Lead Flutter implementation agent      |
| `plan`                        | primary  | gemini-3.1-pro | Planning and architecture sequencing   |
| `general`                     | subagent | gemini-3-pro   | Multi-step research and implementation |
| `explore`                     | subagent | gemini-3-flash | Read-only codebase exploration         |
| `compaction`                  | primary  | gemini-3-flash | Session context compaction             |
| `title`                       | primary  | gemini-3-flash | Session title generation               |
| `summary`                     | primary  | gemini-3-flash | Session summary generation             |
| `flutter-architect`           | subagent | minimax-m2.7   | Architecture, migrations, boundaries   |
| `flutter-ui-builder`          | subagent | kimi-k2.5      | Widgets, screens, responsive layouts   |
| `flutter-state-data`          | subagent | kimi-k2.5      | State management, repositories, async  |
| `flutter-platform-integrator` | subagent | kimi-k2.5      | Android, iOS, web, desktop integration |
| `flutter-performance`         | subagent | minimax-m2.7   | Rebuilds, rendering, startup, memory   |
| `flutter-release-manager`     | subagent | kimi-k2.5      | Flavors, signing, CI, store readiness  |
| `flutter-qa`                  | subagent | kimi-k2.5      | Tests, analysis, regressions           |
| `flutter-reviewer`            | subagent | kimi-k2.5      | Code review, bugs, lifecycle issues    |

### Commands (16)

`/flutter-analyze`, `/flutter-architecture`, `/flutter-codegen`, `/flutter-debug`, `/flutter-feature`, `/flutter-fix`, `/flutter-help`, `/flutter-init`, `/flutter-perf`, `/flutter-platform`, `/flutter-release`, `/flutter-review`, `/flutter-screen`, `/flutter-state`, `/flutter-test`, `/flutter-widget-test`

### Skills (7)

`flutter-architecture`, `flutter-codegen`, `flutter-performance`, `flutter-platform-release`, `flutter-state-management`, `flutter-testing`, `flutter-ui-delivery`

### Tools (3)

- **`flutter_deps`** — Runs `flutter pub outdated` and reports packages with available upgrades
- **`flutter_gen`** — Runs `dart run build_runner build --delete-conflicting-outputs`
- **`flutter_analyze`** — Runs `dart analyze` and `dart format --set-exit-if-changed`

### Event Hooks

- **`.env` protection** — Blocks agents from reading `.env*` files
- **Compaction context** — Injects Flutter-specific preservation rules into session compaction

### Config Defaults (first-run only)

- Dart formatter and LSP
- MCP servers: `context7`, `gh_grep`
- Watcher ignore patterns for `.dart_tool`, `build/`, `Pods/`, `.gradle/`, etc.
- Bash safety permissions
- Companion plugins: `opencode-dynamic-context-pruning`, `opencode-notificator`, `opencode-shell-strategy`

## Update Behavior

- On version update, the plugin re-syncs agents, commands, skills, and AGENTS.md
- Config merge only runs on first install (never overwrites your customizations)
- Version tracked in `~/.config/opencode/.opencode-flutter-version`

## License

MIT
