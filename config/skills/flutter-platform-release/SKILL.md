---
name: flutter-platform-release
description: Handle Flutter platform setup, permissions, flavors, signing, CI, and release readiness
compatibility: opencode
metadata:
  domain: flutter
  scope: platform-release
---

## What I do

- Guide Android, iOS, web, macOS, Windows, and Linux integration when those targets exist
- Track manifests, plist files, entitlements, Gradle, Xcode, flavors, env files, and native setup steps
- Review release implications such as signing, build variants, CI, and store blockers
- Keep platform-specific logic isolated and explicit

## When to use me

Use this for plugin setup, native permissions, deep links, notifications, flavors, release configuration, or delivery workflows.

## Operating rules

- Only reason about platform targets present in the repo.
- Surface manual setup and release caveats explicitly.
- Avoid hidden assumptions about unsupported platforms.
