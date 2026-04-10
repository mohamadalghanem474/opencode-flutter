---
description: Run Flutter tests with the QA agent — unit, widget, integration, or focused on a path/pattern
agent: flutter-qa
subtask: true
---

Run the appropriate Flutter tests for this change.

---

## Context

**Arguments:** $ARGUMENTS

**Flutter test output:**

```
!flutter test --reporter=expanded $ARGUMENTS
```

**Analysis output:**

```
!dart analyze
```

**Changed files:**

```
!git diff --name-only HEAD
```

---

## Instructions

1. Review the test output and analysis above.
2. If tests failed, diagnose the root cause and fix them.
3. If there are analysis errors on changed files, resolve them.
4. Add missing test coverage for any untested public APIs or state logic introduced by recent changes.
5. Ensure all tests pass before finishing.
