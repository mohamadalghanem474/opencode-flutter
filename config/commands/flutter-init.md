---
description: Initialize or update a Flutter-focused AGENTS.md for the current project
agent: build
model: opencode/gemini-3.1-pro
---

Initialize or update the project's AGENTS.md for a Flutter or Dart codebase.

**Project manifest:**
@pubspec.yaml

Required behavior:

- Scan the repo before writing anything.
- Prefer Flutter and Dart project signals first: @pubspec.yaml, @analysis_options.yaml, @README.md, @melos.yaml, @build.yaml, @dart_test.yaml, @firebase.json.
- Also inspect Flutter workspace and delivery files when present, such as `packages/`, `pubspec_overrides.yaml`, `fvm/fvm_config.json`, `fastlane/`, `.github/workflows/`, `codemagic.yaml`, and `bitrise.yml`.
- Inspect project structure including `lib/`, `test/`, `integration_test/`, `android/`, `ios/`, `web/`, `macos/`, `windows/`, and `linux/` when present.
- Capture the real build, format, analyze, and test commands used by this repo.
- Capture whether commands are run through `flutter` and `dart` directly or wrapped by `fvm`, `melos`, `make`, or custom scripts.
- Capture architecture, state management, routing, DI, code generation, linting, testing, and release conventions that are not obvious from filenames alone.
- If code generation exists, record the exact regeneration commands and when they must be run.
- Note platform-specific setup, flavors, env handling, native config, CI or release steps, and common gotchas.
- If AGENTS.md already exists, improve it in place instead of replacing useful content blindly.
- Ask targeted questions only when the repo does not contain enough information.

Write a concise AGENTS.md optimized for future Flutter development agents. Make it specific, practical, and safe to commit.
