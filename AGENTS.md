# Repository Guidelines

This repository is being initialized. Use this guide to keep structure, tooling, and workflow consistent as code is added.

## Project Structure & Module Organization
- `src/`: Application code by domain (`auth/`, `core/`, `ui/`). Keep modules small and cohesive.
- `tests/`: Mirrors `src/` structure. One test file per module.
- `scripts/`: Developer/CI utilities (shell, Node, or Python).
- `assets/`: Static files (images, fixtures, sample data).
- `.github/workflows/`: CI pipelines.
- `docs/`: Design notes and ADRs. Keep short and current.

## Build, Test, and Development Commands
Adopt the set that matches your stack and expose them via `make` or package scripts.
- Node.js: `npm ci`, `npm run dev`, `npm test`, `npm run build`.
- Python: `uv pip install -r requirements.txt` or `poetry install`; test with `pytest`.
- Makefile (optional): `make setup`, `make test`, `make build`, `make lint`.

## Coding Style & Naming Conventions
- JavaScript/TypeScript: Prettier + ESLint; 2‑space indent; `camelCase` for vars, `PascalCase` for classes/types, `kebab-case` for file names.
- Python: Black + Ruff; 4‑space indent; `snake_case` for modules/functions, `PascalCase` for classes.
- Keep functions under ~40 lines; favor pure functions and small modules.

## Testing Guidelines
- Frameworks: Vitest/Jest for Node; Pytest for Python.
- Naming: `src/foo/bar.ts` → `tests/foo/bar.test.ts`; `src/foo/bar.py` → `tests/foo/test_bar.py`.
- Coverage: target ≥80%. Add regression tests for every bug fix.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`.
- Scope by domain: `feat(auth): refresh tokens`.
- PRs: clear description, linked issue (`Closes #123`), screenshots for UI, logs for CLI.
- Keep PRs small (<400 lines diff) and focused.

## Security & Configuration Tips
- Never commit secrets. Provide `.env.example`; load via environment at runtime.
- Limit tokens to least privilege; rotate regularly.
- Review dependency updates; pin versions where stability matters.

