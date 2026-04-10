---
description: Handle Flutter and Dart code generation safely, including build_runner and generated artifacts
agent: build
model: opencode/gemini-3.1-pro
---

Handle this Flutter code generation request: $ARGUMENTS

Requirements:

- Identify the source-of-truth files before changing generated output.
- Respect existing tooling such as `build_runner`, `freezed`, `json_serializable`, `retrofit`, or `drift`.
- Make regeneration steps explicit.
- Keep generated-code churn localized and justified.
- Report required follow-up commands and validation.
