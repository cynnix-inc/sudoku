### Android setup (Windows 11)

- Install Android Studio (latest) with SDK components:
  - **Android SDK Platform**, **Platform-Tools**, **Build-Tools**, **Android Emulator**, **Android SDK Command-line Tools (latest)**
  - Recommended Gradle JDK: **JDK 17** (Temurin/OpenJDK)

- Create an emulator (AVD):
  - Android Studio → Device Manager → Create Device → e.g. Pixel 6/7 → API 34–35 (Android 14/15)
  - Finish, then start the emulator at least once

- Accept licenses (Command-line Tools):
  - Open a new terminal after installing Command-line Tools
  - If needed, install cmdline-tools in SDK Manager first
  - Run (PowerShell):
```powershell
# If sdkmanager is not on PATH, run it from its folder
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
```

- Set ANDROID_HOME and PATH (typical SDK path shown; adjust your username/path if different):
  - ANDROID_HOME: `C:\Users\<you>\AppData\Local\Android\Sdk`
  - Add to PATH:
    - `%ANDROID_HOME%\platform-tools`
    - `%ANDROID_HOME%\emulator`
    - `%ANDROID_HOME%\cmdline-tools\latest\bin`
    - `%ANDROID_HOME%\build-tools\<latest-version>`
  - PowerShell (set permanently for current user):
```powershell
setx ANDROID_HOME "$Env:USERPROFILE\AppData\Local\Android\Sdk"
setx PATH "$Env:PATH;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\cmdline-tools\latest\bin"
```
  - Close and reopen terminals after setting env vars

- Start the emulator before running Android build:
  - Android Studio → Device Manager → Start, or
```powershell
emulator -avd <Your_AVD_Name>
```

#### Troubleshooting
- "sdkmanager/emulator not found": ensure PATH includes the folders above; or run them via Android Studio
- "Licenses not accepted": re-run `sdkmanager --licenses` from Command-line Tools folder
- "No SDKs installed": Android Studio → SDK Manager → install Platform, Build-Tools, Platform-Tools, Command-line Tools
- Gradle JDK errors: Android Studio → Settings → Build Tools → Gradle → Gradle JDK = 17
