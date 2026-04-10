---
name: flutter-codegen
description: Work safely with Flutter and Dart code generation such as build_runner, freezed, json_serializable, and generated APIs
compatibility: opencode
metadata:
  domain: flutter
  scope: codegen
---

## What I do

- Identify generated files and the source-of-truth files that drive them
- Help with `build_runner`, `freezed`, `json_serializable`, `retrofit`, `drift`, and similar tooling
- Keep generated output changes consistent with source annotations and config
- Call out when regeneration, cleanup, or CI updates are required

## When to use me

Use this when a Flutter task touches generated models, unions, serializers, APIs, databases, or annotations.

## Operating rules

- Edit source files, not generated output, unless the repo explicitly expects otherwise.
- Note required regeneration commands and potential conflicts.
- Keep generated-code churn localized and justified.
