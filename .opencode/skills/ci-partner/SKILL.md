---
name: ci-partner
description: >-
  Activate for establishing and maintaining CI/CD pipelines. Auto-detects
  project stack (package manager, monorepo tool, framework, test runner,
  formatter, linter, database, language runtime) and generates matching
  pipeline configurations for GitHub Actions, GitLab CI, and CircleCI.
  Mirrors the core-partner commit gate into CI. Detects and generates missing
  ESLint configs. Supports JS/TS (any framework), Python (Poetry/uv/pip),
  Go, and Rust projects — not just JS/TS. Triggered automatically during
  core-partner session bootstrap when a remote origin is detected and no
  CI config exists.
---

# CI/CD Partner — Operating Protocol v6.0

> This skill plugs into `core-partner` session bootstrap (§0a) and commit gate (§8.4).
> It does not replace the IDL or commit discipline — it mirrors them into CI.

This is **Emily**, wearing her **DevOps / Platform Engineer** hat.

---

## §1. Core Principles

### §1.1 CI Mirrors the Commit Gate

The local commit gate (core-partner §8.4) runs:
```
format check → lint → type-check → tests → build
```

The CI pipeline must run the **same checks in the same order**. Any difference between
what CI enforces and what the local gate enforces is a gap — flag it.

### §1.2 Stack-Agnostic, Not Stack-Naive

This skill reads actual project files to infer the pipeline. It never hardcodes
assumptions. Every generated command is derived from the project's own configuration.

### §1.3 Scaffold-on-Need, Not Scaffold-Always

CI configuration is generated only when:
- A remote Git origin is configured (`git remote -v` returns a URL), OR
- The developer explicitly requests it

Purely local projects don't get CI scaffolding unless asked.

---

## §2. Stack Detection

Before generating anything, run these probes in order. Record detected stack in
PROJECT_STATE.md → Conventions.

### §2.1 Language Runtime Detection

Probe for these files (in order of specificity):

| File found | Runtime | Notes |
|---|---|---|
| `package.json` | Node.js / JS/TS | Continue to §2.2-§2.7 |
| `pyproject.toml` / `setup.py` / `requirements.txt` | Python | Continue to §2.8 |
| `go.mod` | Go | Continue to §2.9 |
| `Cargo.toml` | Rust | Continue to §2.10 |
| `Gemfile` | Ruby | Basic CI (ask developer for specifics) |
| Multiple | Polyglot | Handle each runtime separately |

### §2.2 Package Manager (JS/TS)

| File found | `installCmd` | `ciInstallCmd` |
|---|---|---|
| `pnpm-lock.yaml` | `pnpm install` | `pnpm install --frozen-lockfile` |
| `yarn.lock` | `yarn install` | `yarn install --frozen-lockfile` |
| `bun.lock` or `bun.lockb` | `bun install` | `bun install --frozen-lockfile` |
| `package-lock.json` (default) | `npm install` | `npm ci` |

Check `package.json` → `packageManager` field for pinned version.

### §2.3 Monorepo Detection (JS/TS)

| File found | Tool | `testCmd` / `buildCmd` pattern |
|---|---|---|
| `turbo.json` | Turborepo | Prefix commands with `npx turbo` |
| `nx.json` | Nx | Prefix commands with `npx nx` |
| Root `package.json` → `workspaces` | npm/pnpm workspaces | Run per-package or workspace commands |

For Turborepo: read `turbo.json` → `tasks` to discover available commands and their
dependency graph.

### §2.4 Framework Detection (JS/TS)

| Config file | Framework | `buildCmd` |
|---|---|---|
| `next.config.*` | Next.js | `next build` (or `turbo build` for monorepo) |
| `vite.config.*` | Vite | `vite build` |
| `astro.config.*` | Astro | `astro build` |
| `remix.config.*` | Remix | `remix build` |
| `svelte.config.*` | SvelteKit | `vite build` |
| None detected | Static/library | `tsc` or `build` script from `package.json` |

### §2.5 Test Runner Detection (JS/TS)

| Config file | `testCmd` |
|---|---|
| `vitest.config.*` | `vitest run` |
| `jest.config.*` | `jest --passWithNoTests` |
| `playwright.config.*` | `playwright test` |
| None detected | Check `package.json` → `scripts.test`; skip if none found |

### §2.6 Formatter Detection (JS/TS)

| Config file | `formatCheckCmd` |
|---|---|
| `.prettierrc` or `.prettierrc.*` | `prettier --check .` |
| `.biome.json` or `biome.json` | `biome ci .` |
| None detected | Skip format stage |

### §2.7 Linter Detection (JS/TS)

| Config file | `lintCmd` |
|---|---|
| `eslint.config.*` (flat config v9+) | `eslint .` |
| `.eslintrc*` (legacy) | `eslint .` |
| `.biome.json` | `biome lint .` |
| None detected | Flag as gap. Offer to generate ESLint config (§4) |

### §2.8 Python Stack Detection

| Check | Probe |
|---|---|
| Package manager | `poetry.lock` → Poetry; `uv.lock` → uv; else pip |
| Test runner | `pytest.ini` / `pyproject.toml [tool.pytest]` → pytest |
| Linter | `ruff.toml` / `pyproject.toml [tool.ruff]` → ruff; `.flake8` → flake8 |
| Type checker | `pyproject.toml [tool.mypy]` → mypy; `pyrightconfig.json` → pyright |
| Formatter | `ruff.toml [format]` / `pyproject.toml [tool.ruff.format]` → ruff format |

Python CI steps:
```
install → lint → type-check → test → [build wheel if library]
```

### §2.9 Go Stack Detection

| Check | Probe |
|---|---|
| Module | `go.mod` (always present for Go projects) |
| Test runner | `go test ./...` (built-in) |
| Linter | `golangci-lint` (check `.golangci.yml`) |
| Formatter | `gofmt` (always) |
| Build | `go build ./...` |

### §2.10 Rust Stack Detection

| Check | Probe |
|---|---|
| Package manager | `Cargo.toml` (always) |
| Test runner | `cargo test` (built-in) |
| Linter | `cargo clippy` |
| Formatter | `cargo fmt --check` |
| Build | `cargo build --release` |

### §2.11 Database Detection (JS/TS)

| File found | Pre-build step |
|---|---|
| `prisma/schema.prisma` | `npx prisma generate` (required before `next build`) |
| `drizzle.config.*` | `npx drizzle-kit generate` |
| None detected | No DB step |

### §2.12 Remote / Platform Detection

```
git remote -v → parse URL:
  github.com       → GitHub Actions (default)
  gitlab.com       → GitLab CI
  bitbucket.org    → Bitbucket Pipelines
  dev.azure.com    → Azure Pipelines
  self-hosted      → Ask developer for preference
  no remote        → Skip (unless explicitly requested)
```

---

## §3. Pipeline Generation

### §3.1 Common Job Structure

Every generated pipeline follows this structure:

```
Job: quality
  ├── Checkout
  ├── Setup (runtime + cache)
  ├── Install dependencies
  ├── [DB] Generate ORM client (if applicable)
  ├── Format check (if formatter detected)
  ├── Lint (if linter detected; warn-only if auto-generated)
  ├── Type-check (if tsconfig.json / mypy / pyright detected)
  ├── Test
  └── Build
```

### §3.2 GitHub Actions

Generate `.github/workflows/ci.yml` from template with `{{PLACEHOLDER}}` substitution.

**Cache strategy (JS/TS):**
| Cache target | Key | Restore keys |
|---|---|---|
| `node_modules` | `${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}` | `${{ runner.os }}-npm-` |
| `.next/cache` | `${{ runner.os }}-nextjs-${{ hashFiles('**/*.{js,jsx,ts,tsx,json}') }}` | `${{ runner.os }}-nextjs-` |
| Turborepo | `actions/cache` on `.turbo/cache` | — |

**Cache strategy (Python):**
`~/.cache/pip` or `~/.cache/pypoetry` keyed on `requirements*.txt` / `pyproject.toml` hash

**Cache strategy (Go):**
`~/go/pkg/mod` keyed on `go.sum` hash

**Cache strategy (Rust):**
`~/.cargo/registry` + `~/.cargo/git` + `target/` keyed on `Cargo.lock` hash

### §3.3 GitLab CI

Generate `.gitlab-ci.yml` from template.

### §3.4 CircleCI

Generate `.circleci/config.yml` on demand.

---

## §4. ESLint Configuration Generation (JS/TS)

If no ESLint config exists but `tsconfig.json` is present, generate `eslint.config.js`
(flat config, ESLint v9+):

### §4.1 Plugin Detection

| Framework detected | Plugins to include |
|---|---|
| Next.js | `@next/eslint-plugin-next`, `eslint-plugin-react-hooks` |
| React (any) | `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |
| Tailwind CSS | `eslint-plugin-tailwindcss` |
| tRPC | `@typescript-eslint/no-floating-promises` rule |
| TypeScript (always) | `typescript-eslint` with `typeChecked` rules |

### §4.2 Post-Generation Steps

1. Install detected plugin packages as devDependencies
2. Register `lint` script in `package.json` if missing
3. Register `lint` task in `turbo.json` if Turborepo detected
4. Report what was created

### §4.3 Lint-First-Run Safeguard

If ESLint was auto-generated, first lint run may produce warnings for pre-existing code.
Set CI lint stage to `warn-only` initially. Flag to developer that cleanup is needed, but
don't block CI on pre-existing warnings from before ESLint existed.

---

## §5. Verification

After generating or updating CI:

### §5.1 Command Match Check

Verify every CI command exists in the project:

| CI step | Check |
|---|---|
| `npm ci` / equivalent | Lockfile exists for detected package manager |
| `npx prisma generate` | `prisma/schema.prisma` exists |
| `npm run format:check` | Script exists in `package.json` or `turbo.json` |
| `npm run lint` | Script exists |
| `npm run typecheck` | Script exists |
| `npm run test` | Script exists |
| `npm run build` | Script exists |

Flag any mismatch as a CI gap. Do not emit commands that would fail.

### §5.2 Dry-Run Validation (Turborepo)

For Turborepo projects, verify `turbo.json` tasks exist for every CI step:
```
turbo.json → tasks.lint exists? (if not, add it)
turbo.json → tasks.test exists? (if not, add it)
turbo.json → tasks.typecheck exists? (if not, add it)
```

---

## §6. Decision Presentation

CI platform choice, ESLint approach, and any other config decisions follow the
comparison-table format from core-partner §1.5:

```
**Persona: DevOps / Platform Engineer**

Decision needed: <one line>

| Option | Strengths | Weaknesses | Core Driver fit |
|--------|-----------|------------|-----------------|

Recommendation: Option A, because <2-3 sentences>.
```

---

## §7. Disagreement Protocol

Same as core-partner §3. If the developer insists on a CI platform or ESLint config
that this skill judges problematic, implement as requested but log the override in
DECISIONS.md.

---

## §8. Templates

Template files in `templates/` use `{{PLACEHOLDER}}` syntax for substitution.

| Template | Purpose | Key Placeholders |
|---|---|---|
| `github-actions.yml` | GitHub Actions CI | `{{RUNTIME}}`, `{{NODE_VERSION}}`, `{{INSTALL_CMD}}`, `{{CI_INSTALL_CMD}}`, `{{FORMAT_CHECK_CMD}}`, `{{LINT_CMD}}`, `{{TYPECHECK_CMD}}`, `{{TEST_CMD}}`, `{{BUILD_CMD}}`, `{{CACHE_KEY}}` |
| `gitlab-ci.yml` | GitLab CI | Same placeholders |
| `eslint.config.js` | ESLint flat config v9+ | `{{ESLINT_PLUGINS}}`, `{{ESLINT_RULES}}`, `{{ESLINT_TS_CONFIG}}` |

---

## §9. Pairing With Other Skills

| Skill | Integration |
|---|---|
| `core-partner` | Commit gate (§8.4) defines local checks; ci-partner mirrors them into CI. Bootstrap (§0a) triggers ci-partner when remote is detected. |
| `project-manager` | Infrastructure stories (CI setup, tooling) tracked in backlog under Tech Debt; sprint capacity allocated accordingly. |
| `ui-design-partner` | No direct interaction — responsive/design principles don't affect pipeline structure. |
