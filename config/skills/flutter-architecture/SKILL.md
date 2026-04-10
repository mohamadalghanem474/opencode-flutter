---
name: flutter-architecture
description: Plan Flutter feature boundaries, routing, dependency direction, and large-scale refactors
compatibility: opencode
metadata:
  domain: flutter
  scope: architecture
---

## What I do

- Map feature boundaries across `lib/`, packages, and platform layers
- Decide where UI, state, domain, data, and platform logic should live
- Guide routing, dependency injection, and migration sequencing
- Reduce churn by preserving the repo's existing architecture when viable

## When to use me

Use this for structural Flutter work such as new feature slices, package boundaries, navigation changes, refactors, or dependency cleanup.

## Operating rules

- Inspect the existing architecture before proposing changes.
- Prefer incremental migrations over broad rewrites.
- Preserve public APIs unless the task explicitly requires a break.
- Call out code generation, testing, and platform implications when structure changes.
