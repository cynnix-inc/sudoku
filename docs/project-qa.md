# Project Setup Q&A — Ultimate Sudoku

This file captures key environment, workflow, and design choices.

---

## Stack and Platforms

**Q1. App platform and runtime**  
What is the primary stack and do we include a backend service in v1?  
A1. Expo + TypeScript + React Native Web. No backend logic unless required.

**Q2. Primary database or backend service**  
Which service stores auth and data?  
A2. Supabase (auth, DB, storage).

**Q3. Hosting and distribution targets**  
Where is the web app hosted and how are native builds produced?  
A3. Netlify for web. Native builds handled locally with Expo prebuild, Android Gradle, and Xcode. No EAS.

**Q4. API requirement for v1**  
Do we need a custom API server at launch?  
A4. Not required for Sudoku v1. Possible later for leaderboards.

**Q5. Platform targets**  
Which platforms do we support at launch?  
A5. Web, iOS, Android.

---

## Design and UX

**Q6. Visual style direction**  
What overall style should guide UI components and screens?  
A6. Flat dark and light themes. Glass blur only for overlays like Home/Main Menu, Pause, settings, etc (Glassmorphism)

**Q7. Theme support and switching**  
Do we support both themes and allow user choice?  
A7. Yes, users can toggle between light and dark

**Q8. Color and typography guidelines**  
Any brand constraints or general guidance?  
A8. None fixed. Use modern, fresh, high-contrast colors. Prioritize Sudoku number readability.

**Q9. Haptics, audio, and animation**  
Do we include these from the start?  
A9. Yes, include for gameplay polish.

---

## Accounts and Cloud

**Q10. Store accounts readiness**  
Are Apple and Google distribution accounts ready?  
A10. Apple maybe, not confirmed. Google Play yes. Connect later.

**Q11. Expo account and project identity**  
Do we have an Expo account and project name?  
A11. Expo account TBD. Project name Ultimate Sudoku.

**Q12. Cloud features in v1**  
Which cloud features ship at launch?  
A12. Logins, stat sync, settings sync, and leaderboards.

**Q13. Auth and database provider**  
Which provider handles auth, DB, and storage?  
A13. Supabase. Open to alternatives later.

**Q14. Remote configuration and flags**  
Do we support feature flags or simple experiments?  
A14. Yes. Supabase feature_flags table, all default off.

---

## Repository and Tooling

**Q15. Repository shape**  
Single app or monorepo?  
A15. Single app repo on GitHub Teams.

**Q16. Package manager**  
What do we use across local and CI?  
A16. npm.

**Q17. Node version and manager**  
Which Node version is pinned and how?  
A17. Node 22 LTS pinned via Volta

---

## Testing and Quality

**Q18. Test levels included at start**  
Which levels do we maintain from day one?  
A18. Unit, component, and web E2E now. Native E2E with Detox later.

**Q19. Acceptance criteria format**  
How do we describe done for features?  
A19. Plain-language checklists with Given-When-Then examples.

**Q20. Coverage thresholds**  
What minimums are enforced in CI?  
A20. 90 percent for core logic, 80 percent for UI, 70 percent for E2E.

---

## CI and Releases

**Q21. Source hosting and CI tool**  
What platform runs the checks?  
A21. GitHub Actions on GitHub Teams.

**Q22. Release model**  
How do we shape branches and releases?  
A22. Trunk-based with short feature branches.  
Web uses Netlify previews on PRs and auto deploy on main.  
Native uses manual local builds, Google Play Internal Testing, and TestFlight.

**Q23. Environments and promotion strategy**  
How do changes move through stages?  
A23. Web uses Netlify contexts: deploy-preview for PRs, staging on a release branch, production on main.  
Native promotes through Google Play tracks and TestFlight.

---

## Observability and Privacy

**Q24. Error tracking plan**  
Do we integrate crash reporting now?  
A24. Stubbed Sentry, off by default. Enable later.

**Q25. Analytics scope**  
What do we track and how is it separated from user stats?  
A25. Internal usage metrics like puzzle start, completion, and session length. Leaderboards are separate.

**Q26. Privacy and compliance constraints**  
Any constraints we must follow now?  
A26. None at this time.

---

## Security

**Q27. Secret management approach**  
How do we handle secrets in dev and CI?  
A27. Expo .env files with a typed helper. No committing secrets.

**Q28. Security policies and guardrails**  
What defaults do we enforce?  
A28. Supabase RLS on by default with least privilege. Deep link allowlist. Dependency checks in CI.

---

## Performance

**Q29. Performance budgets and targets**  
What goals do we hold the app to?  
A29. Cold start under 2 seconds on mid-range Android. 60 FPS during play. Keep bundle small.

**Q30. Minimum OS versions**  
What are the minimum supported versions?  
A30. Android minSdk 24. iOS 15.1 or newer.

---

## Workflow and Docs

**Q31. Branching strategy**  
How do we branch during development?  
A31. Trunk-based on main with short-lived feature branches.

**Q32. Conventional commits and changelog**  
Do we enforce commit style and generate changelogs?  
A32. Yes. Conventional commits and Changesets automated changelog.

**Q33. Cursor rules and PR templates**  
Do we keep project rules and a PR template in repo?  
A33. Yes. Rules for project, architecture, style, testing, security, devops, and prompts.

**Q34. Test generation policy**  
Do new components and screens require tests?  
A34. Yes. Tests are required and auto-suggested by Cursor prompts.

**Q35. Versioning automation**  
How are versions bumped and released?  
A35. Changesets with conventional commits.

**Q36. README automation**  
Do scripts autogenerate parts of the README?  
A36. Yes. Scripts update scripts, env, and hosting sections.

**Q37. Onboarding docs automation**  
Do we keep onboarding docs in sync?  
A37. Yes. Supabase and CI docs are generated and synced.

---

## Project Identity

App name: Ultimate Sudoku  
Repo slug: ultimate-sudoku  
Android applicationId: com.cynnix.ultimate_sudoku  
iOS bundle identifier: com.cynnix.ultimateSudoku

---

## Distribution Plan

Web hosting: Netlify  
Netlify site name: TBD  
Netlify contexts: deploy-preview for PRs, staging on a release branch, production on main

Android: local signed builds, upload to Google Play Internal Testing, then promote  
iOS: local Xcode builds, TestFlight when Apple Developer account is ready

---

## Device Support Matrix

iOS minimum: 15.1  
Android minimum: SDK 24  
Target devices: modern phones, tablets TBD  
Performance budgets: cold start under 2 seconds on mid-range Android, 60 FPS in play

---

## Assets Pipeline

Icons and splash: exported from Figma, stored in /assets  
Fonts: system stack for now, add custom later with proper licenses

---

## Accessibility Targets

Contrast: WCAG AA for text  
Tap targets: 44x44 points minimum  
Dynamic type: supported

---

## Security Posture

Supabase RLS: enabled on all tables  
Secrets: .env files locally, not committed  
Deep links: app scheme only and trusted hosts

---

## Automation Toggles

Docs-only PRs: eligible for auto-merge after green checks  
Coverage gates: 90 percent core logic, 80 percent UI, 70 percent E2E

---

## License

License: MIT, adjust if needed

---

## Localization

Default language: English  
Future languages: TBD  
String management: central i18n module

---

## Telemetry Consent

Internal analytics only: puzzle start, completion, session length  
Opt-out: environment flag for dev builds
