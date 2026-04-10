---
description: Review Flutter changes for bugs, regressions, lifecycle issues, and missing tests
agent: flutter-reviewer
model: opencode-go/kimi-k2.5
subtask: true
---

Review this Flutter change or topic: $ARGUMENTS

**Analysis output:**

```
!flutter analyze
```

**Staged diff:**

```
!git diff --cached
```

Start with findings ordered by severity. Focus on correctness, regressions, lifecycle issues, performance, platform risk, and missing tests.
