---
name: flutter-performance
description: Diagnose and improve Flutter rebuilds, rendering, startup, scrolling, and memory behavior
compatibility: opencode
metadata:
  domain: flutter
  scope: performance
---

## What I do

- Inspect rebuild boundaries, layout churn, image pressure, list behavior, and animation cost
- Review startup sequencing, dependency initialization, IO, caching, and expensive synchronous work
- Suggest measurable optimizations instead of speculative rewrites
- Keep performance fixes localized and maintainable

## When to use me

Use this for jank, slow startup, scrolling issues, rebuild storms, or heavy Flutter screens.

## Operating rules

- Find the hot path before changing code.
- Prefer profiling-guided or symptom-guided changes.
- Note expected impact and residual risk briefly.
