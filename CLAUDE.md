# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
just --list          # Show all available commands
just check           # Run lint, test, docs in parallel — do this before committing
just lint            # Language-specific linting and type checking
just test            # Run tests with coverage
just docs            # Build Sphinx documentation
just dev             # Start development server
just build           # Production build
```

Pre-commit hooks run automatically on commit and include linting with auto-fix, type checking, gitleaks, YAML validation, and end-of-file fixing.

**IMPORTANT: If you changed or added any file under `docs/`, you MUST run `just docs` and confirm it succeeds BEFORE committing.** New pages must be added to the appropriate `toctree` in the parent index (e.g. `docs/explanations.md`) or the build will fail with a `toc.not_included` warning. CI treats Sphinx warnings as errors.

## Git Workflow

- **Commit messages** use [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix:`, `feat:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **NEVER push directly to main.** All changes go through PRs.
- **Releases:** Push a git tag (e.g. `git tag v1.2.3 && git push origin v1.2.3`). CI publishes artifacts and creates a GitHub Release with auto-generated notes.

## Deployment

Docker container serving the application and proxying API requests. Helm chart in `helm/argocd-monitor/`. CI runs lint → container build → helm package → docs publish.
