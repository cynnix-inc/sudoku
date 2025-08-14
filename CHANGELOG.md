# Changelog

All notable changes to this project will be documented in this file.

This format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-08-14

### Changes

- **Added**:
  - feat: add toast notifications, improve modal scrolling, and enhance test coverage (300d6a5d)
  - chore: update CSP, service worker, and icons; add daily results to stats (ecd0629e)
  - feat(calendar): add calendar highlight feature and update tests (9c3c34c6)
  - test(e2e): make landing visible in automation, add Solve menu item, keep help About collapsed by default; record win on completion in automation; keep board width scaling responsive (766e4094)
  - chore: add dev logger, supabase retry/backoff, extract timer and health helpers, wire into index (fc45a8fb)
  - chore: tighten connect-src CSP, add aria-invalid and modal auto-focus, debounce resize (06810fde)
  - chore: tighten CSP, externalize inline scripts, expand SW precache and nav fallback, add PNG icons + generator, sync SW version, add CI workflow, modal focus trap (8e818a83)
  - chore(security): add CSP via headers and meta; add fallback env.js to avoid 404; set no-store for env.js (e223ea4b)
  - new hint types (c1694010)
  - chore: add GH Action to auto-update CHANGELOG on main; add npm script and docs (54a5b8d5)
  - docs: add CHANGELOG.md and script; generate initial history from git log (1651abff)
  - new health bar (af79dbc6)
  - ui overhaul and new settings (b6162b0a)

- **Changed**:
  - docs(changelog): update local changelog (b5fd741f)
  - docs(changelog): update local changelog (e265cb1a)
  - docs(changelog): update local changelog (e436acac)
  - docs(changelog): update local changelog (b2d473a0)
  - docs(changelog): update local changelog (451c8123)
  - docs(changelog): update local changelog (d02ba3be)
  - chore(husky): auto-update CHANGELOG locally on commit and before push (a0ee41cd)
  - docs(changelog): update local changelog (ec3d613b)
  - Update generate-version.js to improve version generation logic (a9ee91e8)
  - chore: update CHANGELOG.md [skip ci] (1cd37d6c)
  - Refactor: update UI to use "Lives" instead of "Mistakes" throughout game interface and help text (9f0d9b3a)
  - chore: update CHANGELOG.md [skip ci] (431505b8)
  - ci: ignore CHANGELOG.md pushes; skip CI on [skip ci]; remove duplicate changelog workflow (3fb3bd12)
  - docs(changelog): automated update (738aa7e1)
  - ci: ignore CHANGELOG.md pushes; skip CI on [skip ci]; deprecate duplicate changelog workflow (546ca955)
  - chore: sync lockfile for Netlify npm ci (f6d30b6f)
  - docs(changelog): automated update (b093f443)
  - baby with the bathwater (e9100af1)
  - test: stabilize idle headless timers and overlay, normalize modal display fallbacks, guard timer updates (f67b7c08)
  - chore: update CHANGELOG.md [skip ci] (3be35046)
  - chore: update CHANGELOG.md [skip ci] (473ba485)
  - qlf (f45cd408)
  - update env config (0fa06f58)
  - kitchen sink (842c5630)
  - enhancements 1.0.0 (b8147d45)
  - Alpha (5db0960f)
  - qlf (a05d4386)
  - auto reload (c2c0efe6)
  - daily challenge enhancements (c5ea5c64)
  - grid overhaul 2 (c80f659c)
  - grid overhaul (69154ca4)

- **Fixed**:
  - Fix appearance sizing preview and modal interactions (0d53a1f2)
  - ci(changelog): disable auto-update on push; run only via manual dispatch (84690be2)
  - env fixes (c1490cca)
  - mobile layout fixes (fb445219)
  - mobile layout fixes (38fc6079)
  - mobile fixes (52580015)
  - dev menu fixes (3d9879b4)
  - heart display fix (e2a88599)
  - more bug fixes from SG! (1f50a549)
  - more bug fixes from SG (4eaaf8b2)
  - bug fixes, enhancements, testing (171223e3)
  - bug fixes, includeing game over. (2ae142f2)
  - qlf fixes 2025-08-09 (01b90d6f)
  - fixed menus (848634f8)
  - qlf fixes (81e59928)
  - grid fixes yet again (c265fc34)
  - grid mobile fixes (2cf965d6)
  - grid 3x3 fixes (6f7b03e1)
  - mobile grid fixes (2e0037ba)

- **Tests**:
  - chore: ignore and untrack test artifacts (test-results/, test-report/) (862fad7b)
  - Remove completed tests from todo list in UI and help text: always use "Lives" instead of "Mistakes" (74ba79e8)
  - feat: idle controls in settings, headless idle init, help interactions; adjust tests for idle display variants; persist idle settings; wire DOM bindings (1e0cf4ea)
  - mobile unit tests (b849163f)


## [1.0.1] - 2025-08-09

### Initial release

- **Changed**:
  - First release (ff8983ad)
