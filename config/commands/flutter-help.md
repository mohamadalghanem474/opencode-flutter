---
description: Show the Flutter-specific OpenCode agents, skills, and commands available in this setup
agent: plan
model: opencode/gemini-3-flash
---

Explain this Flutter-focused OpenCode setup.

If the user passes an argument, tailor the answer to that topic: $ARGUMENTS

Cover briefly:

- Primary agents: `build`, `plan`
- Built-in subagents now specialized for Flutter: `general`, `explore`
- Flutter specialist subagents (hidden, dispatched by `build`/`general`): `flutter-architect`, `flutter-ui-builder`, `flutter-state-data`, `flutter-platform-integrator`, `flutter-performance`, `flutter-release-manager`, `flutter-qa`, `flutter-reviewer`
- Available Flutter skills: `flutter-architecture`, `flutter-state-management`, `flutter-ui-delivery`, `flutter-testing`, `flutter-performance`, `flutter-platform-release`, `flutter-codegen`
- Available Flutter commands: `/flutter-init`, `/flutter-screen`, `/flutter-feature`, `/flutter-architecture`, `/flutter-state`, `/flutter-widget-test`, `/flutter-review`, `/flutter-perf`, `/flutter-platform`, `/flutter-release`, `/flutter-analyze`, `/flutter-debug`, `/flutter-codegen`, `/flutter-test`, `/flutter-fix`
- MCP servers: `context7` (library docs lookup), `gh_grep` (GitHub code search via grep.app)
- Custom tools: `flutter_deps` (pub outdated), `flutter_gen` (build_runner), `flutter_analyze` (dart analyze + format check)
- Plugins: `opencode-dynamic-context-pruning`, `opencode-notificator`, `opencode-shell-strategy`

Prefer short practical guidance and tell the user which command or agent fits their need best.
