# Bug sub-issue template

Use this template when creating a new Bug sub-issue under an Epic.

## Title

```
[Bug] <short, specific title>
```

## Labels

- type/bug
- area/<ui|game|services|android|ios|web|...>
- status/triage (default)
- priority/<p1|p2> (default; use p0 only for crashes, data loss, or security)
- mode/<classic|daily> (if applicable)

## Body

```
Parent: #<epic-number>

Steps to Reproduce:
1. <step one>
2. <step two>
3. <...>

Expected:
- <what should happen>

Actual:
- <what actually happens>

Logs:
- <logs, screenshots, device info, OS/app versions>

Acceptance Criteria:
- <criterion 1>
- <criterion 2>

Out of scope:
- <not included>

Tech notes:
- <implementation hints, references, files/dirs involved>
```

## GitHub CLI examples

PowerShell-safe one-liner (fill placeholders):

```powershell
gh sub-issue create --parent <EPIC_NUMBER> --title "[Bug] <SHORT_TITLE>" --body "Parent: #<EPIC_NUMBER>`n`nSteps to Reproduce:`n1. <step one>`n2. <step two>`n`nExpected:`n- <expected>`n`nActual:`n- <actual>`n`nLogs:`n- <logs or attach>`n`nAcceptance Criteria:`n- <criterion one>`n- <criterion two>`n`nOut of scope:`n- <out>`n`nTech notes:`n- <notes>" --label "type/bug,area/<AREA>,priority/p1,status/triage<,mode/<classic|daily>>" -R cynnix-inc/sudoku
```

List all sub-issues under an epic:

```powershell
gh sub-issue list <EPIC_NUMBER> -R cynnix-inc/sudoku --state all
```


