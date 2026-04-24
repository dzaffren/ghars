# Contributing to Ghars

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, semantic commit history.

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, semicolons, etc.) — **not** CSS
- **refactor**: Code refactoring without feature/bug changes
- **perf**: Performance improvement
- **test**: Test addition or modification
- **chore**: Build, deps, CI config, etc.
- **ci**: CI/CD changes
- **revert**: Revert a previous commit

### Scope
One of:
- `auth` — authentication, OAuth, session
- `api` — API routes, endpoints
- `llm` — LLM adapter, prompts, model integration
- `mission` — mission generation, judging
- `ui` — pages, components, styling
- `db` — Supabase schema, migrations
- `pwa` — service worker, manifest, push
- `deps` — dependency updates
- `config` — Next.js, Tailwind, tsconfig, etc.

### Subject
- Imperative mood ("add", not "adds" or "added")
- Lowercase (except proper nouns)
- No period at the end
- Max 50 characters

### Body
- Explain **why**, not what (the code shows what)
- Wrapped at 72 characters
- Separate from subject with blank line

### Footer
- Reference issues: `Closes #123`, `Fixes #456`
- Co-authors: `Co-Authored-By: Name <email@example.com>`

### Examples

**Good:**
```
feat(mission): generate missions weighted by user focus areas

Use the LLM to pick verses from the actionable pool that match
the user's selected focus areas (patience, gratitude, etc.).
This personalizes the experience and improves engagement.

Closes #42
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Good:**
```
fix(reflection): handle empty tafsir snippet gracefully

The tafsir_snippet field can be null if the Ibn Kathir tafsir
is unavailable for a verse. Wrap display in conditional.

Fixes #89
```

**Good:**
```
docs(readme): add quickstart instructions
```

---

## Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make commits with semantic messages (hooks will validate)
3. Push and open a PR
4. Hooks check:
   - `commitlint` validates commit messages
   - `lint-staged` runs TypeScript check + Prettier on changed files

If a hook fails:
- **commitlint**: Fix the message and re-commit
- **lint-staged**: Fix the issues, re-stage, and re-commit

---

## Co-authoring with Claude

When Claude writes code, the commit footer includes:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

This gives credit and is useful for understanding who made each change.
