# Workspace hygiene

## Keep scratch files out of the project

The active workspace is the project directory. Every file you create there
lands in `git status`, in code review, and in the next session's context.

Write a scratch file to `.omo/` instead. That folder holds notes, plans,
summaries, dumps and temporary scripts, and it stays out of version control.

| Instead of | Write |
| --- | --- |
| `MEMORY.md` | `.omo/MEMORY.md` |
| `FINAL_SUMMARY.md` | `.omo/FINAL_SUMMARY.md` |
| `NOTES.md`, `TODO.md`, `PLAN.md` | `.omo/<same name>` |
| `scratch.py`, `tmp.sh` | `.omo/scratch.py`, `.omo/tmp.sh` |

## Rules

1. Create a new file at the project root only when the project needs it:
   source code, tests, docs that ship, or config the tool reads.
2. Before you write a file whose name is not part of the project, ask yourself
   where it belongs. The answer is `.omo/`.
3. Never write a summary, a memory file or a report into the project root
   unless the user names that exact path.
4. A file you need only to think, to hand a result back, or to remember
   something between turns goes in `.omo/`.
5. Do not commit `.omo/`. If the project has no `.gitignore`, or its
   `.gitignore` lacks the entry, add `.omo/` to `.gitignore` before you write
   the first file there.
6. The user's own files win. If the project already tracks a `MEMORY.md` or a
   `docs/` note, update it in place. Do not move it to `.omo/` and do not
   create a second copy.

## What `.omo/` is not

- It is not a second source tree. Code, tests and shipped docs stay where the
  project puts them.
- It is not durable. Treat it as scratch: a fresh clone will not have it, and
  the user may delete it at any time.
- It is not a place for secrets. The rules in
  `secrets-and-verification.md` apply to `.omo/` too, because a scratch file
  is still a file on disk.

## Example

You finish a task and want to leave a summary for the user.

```bash
mkdir -p .omo
printf '# Task summary\n\n- Changed: src/api.ts\n' > .omo/FINAL_SUMMARY.md
```

The project root stays clean, and `git status` shows only the real change.
