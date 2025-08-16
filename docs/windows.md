## Windows setup

This guide helps you get a Windows 11 dev machine ready for this repo using Volta (recommended) or nvm-windows. It also covers enabling Developer Mode for symlinks and the PowerShell commands to run the project.

### Enable Developer Mode (symlinks)

Symlinks improve install speed and are required by some tooling.

- Windows 11: Settings → System → For developers → Enable "Developer Mode"
- Windows 10: Settings → Update & Security → For developers → Enable "Developer Mode"

You can also enable via PowerShell (Run as Administrator):

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d 1
```

### Option A: Volta (recommended)

Volta pins tool versions per project automatically based on `package.json`.

1) Install Volta

```powershell
winget install Volta.Volta
```

2) Open a new PowerShell window so `volta` is on PATH, then verify:

```powershell
volta --version
```

3) Project toolchain

- This repo pins: Node `22.5.1` and pnpm `9.12.0` (see root `package.json` → `volta`).
- Simply `cd` into the repo and Volta will auto-download/use the pinned versions. If you want to pre-install manually:

```powershell
volta install node@22 pnpm@9.12.0
```

Notes:

- `node@22` will track Node 22 LTS; the project pin ensures `22.5.1` when inside this repo.
- Volta isolates global tool versions from other projects.

### Option B: nvm-windows

If you prefer nvm-windows, install and select Node 22, then activate pnpm.

1) Install nvm-windows

- Download and run the installer from the nvm-windows releases page: `https://github.com/coreybutler/nvm-windows/releases`

2) Install and use Node 22 LTS (match the repo pin `22.5.1` if available)

```powershell
nvm list available | Select-String 22
nvm install 22.5.1
nvm use 22.5.1
node -v
```

3) Activate pnpm 9.12.0 (via Corepack or npm)

```powershell
# Recommended (Corepack is bundled with Node 16.9+)
corepack enable
corepack prepare pnpm@9.12.0 --activate

# Or, using npm (global install)
npm i -g pnpm@9.12.0
```

### PowerShell: run the project

From the repo root:

```powershell
# 1) Install dependencies
pnpm install

# 2) Start the app (Expo dev server)
pnpm dev

# Alternative entry points
pnpm web       # run web
pnpm android   # run Android (requires Android SDK/Emulator)
pnpm ios       # run iOS (macOS only)

# Quality checks
pnpm lint
pnpm test
pnpm e2e       # requires Playwright; first-time: pnpm exec playwright install --with-deps
```

### Tips & troubleshooting

- If you see EPERM/EPROTO related to symlinks, ensure Developer Mode is enabled and restart the terminal.
- After installing Volta or nvm-windows, open a new PowerShell so PATH updates apply.
- Use PowerShell 7+ if possible (`pwsh`) for the best experience.
- On Windows, `pnpm ios` won’t work (iOS requires macOS). Use Android or Web.


