---
name: flutter-testing
description: Add or improve Flutter unit, widget, integration, and regression coverage using repo-native patterns
compatibility: opencode
metadata:
  domain: flutter
  scope: testing
---

## What I do

- Choose the smallest effective test level for a change
- Add unit tests for logic, widget tests for UI behavior, and integration tests when cross-layer confidence is required
- Cover loading, empty, error, retry, permission, and navigation flows
- Keep tests deterministic and aligned with the current helpers, mocks, and fixtures

## When to use me

Use this when behavior changes and you need the right Flutter test strategy or better coverage.

## Operating rules

- Prefer focused widget tests over broad integration tests when possible.
- Match existing test helpers and naming conventions.
- Call out untested platform or release risk when validation is incomplete.
