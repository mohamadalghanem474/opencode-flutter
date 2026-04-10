---
description: Fix a Flutter bug, analysis error, or test failure — describe it or paste the error output
agent: build
---

Fix the following issue in this Flutter project.

---

## Issue

$ARGUMENTS

---

## Current state

**Analysis:**

```
!dart analyze
```

**Failed tests (if any):**

```
!flutter test --reporter=expanded 2>&1 | head -80
```

**Recent changes:**

```
!git diff --stat HEAD~1
```

---

## Instructions

1. Understand the root cause before touching code.
2. Apply the minimal targeted fix — avoid unrelated changes.
3. Verify `dart analyze` passes after the fix.
4. If the issue was a test failure, confirm the test now passes.
5. Summarize what was wrong and what was changed.
