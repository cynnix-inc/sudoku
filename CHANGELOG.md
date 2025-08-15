# Changelog

All notable changes to this project will be documented in this file.

This format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-08-15

### Changes

- **Added**:
  - CI: add minimal placeholder workflow (db53c58)
  - Add gitleaks report to archive (f84c75e)
  - feat: introduce new game types and enhance UI responsiveness (580288b)
  - chore: add root path header for improved content type handling (6c40078)
  - chore: update index.html and package-lock.json, add shell scripts for bin files (0c5fe31)
  - feat: add toast notifications, improve modal scrolling, and enhance test coverage (300d6a5)
  - chore: update CSP, service worker, and icons; add daily results to stats (ecd0629)
  - feat(calendar): add calendar highlight feature and update tests (9c3c34c)
  - test(e2e): make landing visible in automation, add Solve menu item, keep help About collapsed by default; record win on completion in automation; keep board width scaling responsive (766e409)
  - chore: add dev logger, supabase retry/backoff, extract timer and health helpers, wire into index (fc45a8f)
  - chore: tighten connect-src CSP, add aria-invalid and modal auto-focus, debounce resize (06810fd)
  - chore: tighten CSP, externalize inline scripts, expand SW precache and nav fallback, add PNG icons + generator, sync SW version, add CI workflow, modal focus trap (8e818a8)
  - chore(security): add CSP via headers and meta; add fallback env.js to avoid 404; set no-store for env.js (e223ea4)
  - new hint types (c169401)
  - chore: add GH Action to auto-update CHANGELOG on main; add npm script and docs (54a5b8d)
  - docs: add CHANGELOG.md and script; generate initial history from git log (1651abf)
  - new health bar (af79dbc)
  - ui overhaul and new settings (b6162b0)

- **Changed**:
  - docs(changelog): update local changelog (3e30fc6)
  - docs(changelog): update local changelog (7226a8a)
  - docs(changelog): update local changelog (8cd6d63)
  - Remove env.js and ignore local env files (ee2bc5f)
  - feat: confirmation dialogs and related updates (e9bad31)
  - docs(changelog): update local changelog (66fe831)
  - feat: improve board focus stability and enhance game type UI (63d2d52)
  - docs(changelog): update local changelog (9af5ff9)
  - docs(changelog): update local changelog (5fe69e9)
  - chore: enhance SEO and toast notification system (d02542b)
  - docs(changelog): update local changelog (77e4200)
  - docs(changelog): update local changelog (e1b995d)
  - chore: update Netlify headers for improved security (137e9d8)
  - docs(changelog): update local changelog (745559e)
  - chore: update Netlify headers and enhance index.html metadata (36a6991)
  - style: update footer styles and improve accessibility for health bar (20b563c)
  - full screen home on mobile (0028837)
  - feat: enhance mobile experience and improve landing overlay behavior (074aeb4)
  - docs(changelog): update local changelog (235f330)
  - docs(changelog): update local changelog (e265cb1)
  - docs(changelog): update local changelog (e436aca)
  - docs(changelog): update local changelog (b2d473a)
  - docs(changelog): update local changelog (451c812)
  - docs(changelog): update local changelog (d02ba3b)
  - chore(husky): auto-update CHANGELOG locally on commit and before push (a0ee41c)
  - docs(changelog): update local changelog (ec3d613)
  - Update generate-version.js to improve version generation logic (a9ee91e)
  - chore: update CHANGELOG.md [skip ci] (1cd37d6)
  - Refactor: update UI to use "Lives" instead of "Mistakes" throughout game interface and help text (9f0d9b3)
  - chore: update CHANGELOG.md [skip ci] (431505b)
  - ci: ignore CHANGELOG.md pushes; skip CI on [skip ci]; remove duplicate changelog workflow (3fb3bd1)
  - docs(changelog): automated update (738aa7e)
  - ci: ignore CHANGELOG.md pushes; skip CI on [skip ci]; deprecate duplicate changelog workflow (546ca95)
  - chore: sync lockfile for Netlify npm ci (f6d30b6)
  - docs(changelog): automated update (b093f44)
  - baby with the bathwater (e9100af)
  - test: stabilize idle headless timers and overlay, normalize modal display fallbacks, guard timer updates (f67b7c0)
  - chore: update CHANGELOG.md [skip ci] (3be3504)
  - chore: update CHANGELOG.md [skip ci] (473ba48)
  - qlf (f45cd40)
  - update env config (0fa06f5)
  - kitchen sink (842c563)
  - enhancements 1.0.0 (b8147d4)
  - Alpha (5db0960)
  - qlf (a05d438)
  - auto reload (c2c0efe)
  - daily challenge enhancements (c5ea5c6)
  - grid overhaul 2 (c80f659)
  - grid overhaul (69154ca)

- **Fixed**:
  - Fix appearance sizing preview and modal interactions (0d53a1f)
  - ci(changelog): disable auto-update on push; run only via manual dispatch (84690be)
  - env fixes (c1490cc)
  - mobile layout fixes (fb44521)
  - mobile layout fixes (38fc607)
  - mobile fixes (5258001)
  - dev menu fixes (3d9879b)
  - heart display fix (e2a8859)
  - more bug fixes from SG! (1f50a54)
  - more bug fixes from SG (4eaaf8b)
  - bug fixes, enhancements, testing (171223e)
  - bug fixes, includeing game over. (2ae142f)
  - qlf fixes 2025-08-09 (01b90d6)
  - fixed menus (848634f)
  - qlf fixes (81e5992)
  - grid fixes yet again (c265fc3)
  - grid mobile fixes (2cf965d)
  - grid 3x3 fixes (6f7b03e)
  - mobile grid fixes (2e0037b)

- **Tests**:
  - chore: ignore and untrack test artifacts (test-results/, test-report/) (862fad7)
  - Remove completed tests from todo list in UI and help text: always use "Lives" instead of "Mistakes" (74ba79e)
  - feat: idle controls in settings, headless idle init, help interactions; adjust tests for idle display variants; persist idle settings; wire DOM bindings (1e0cf4e)
  - mobile unit tests (b849163)


## [1.0.1] - 2025-08-09

### Initial release

- **Changed**:
  - First release (ff8983a)
