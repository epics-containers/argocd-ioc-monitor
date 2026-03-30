---
name: documentation
description: "Guidelines for writing and maintaining project documentation. TRIGGER when: writing, editing, or reviewing documentation files in docs/. DO NOT TRIGGER when: editing code comments or README files."
---

> **Generic skill** — This skill is project-agnostic. Do not add project-specific
> references, paths, or terminology here.

# Documentation Skill

Guidelines for writing and maintaining project documentation.

## When to Use

Use this skill when:
- Writing or editing documentation files in `docs/`
- Reviewing documentation for correctness or completeness
- Adding new documentation pages

## Principles

### Embed, don't copy

Never duplicate file contents into documentation. Instead, use Sphinx
directives to include the real file so docs stay in sync automatically:

````md
```{literalinclude} ../../path/to/real/file.yaml
:language: yaml
```
````

If a full include is too long, use `:lines:` or `:start-after:` /
`:end-before:` to select a portion.

### Describe patterns, don't enumerate files

When documenting directory layouts or file sets that vary, describe the
general structure and mention that additional files may exist. Listing
every optional file creates maintenance burden and goes stale as the
project evolves.

### Keep skill and command references accurate

When referencing Claude Code skills (slash commands), use the actual skill
name from `.claude/skills/*/SKILL.md`. If a skill is renamed or removed,
update all documentation that references it.

### Single source of truth

If two docs cover the same topic, consolidate into one and link to it from
the other. Avoid parallel pages that drift apart over time.

### Diataxis framework

This project follows the [Diataxis](https://diataxis.fr) documentation
framework:

- **Tutorials** — learning-oriented, get the user to a working result
- **How-to guides** — task-oriented, practical steps for experienced users
- **Explanations** — understanding-oriented, how and why things work
- **Reference** — information-oriented, precise technical specifications
