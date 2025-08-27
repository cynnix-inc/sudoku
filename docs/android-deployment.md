# Android App Deployment Guide

This guide covers the complete process of building, signing, and deploying the Ultimate Sudoku Android app to Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Version Management](#version-management)
3. [Keystore Setup](#keystore-setup)
4. [Building the App](#building-the-app)
5. [Google Play Console Setup](#google-play-console-setup)
6. [Release Process](#release-process)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Android development environment set up (see [android-setup.md](./android-setup.md))
- ✅ Google Play Console account with developer access
- ✅ Google Play Console app created
- ✅ Node.js 20.x (managed by Volta)
- ✅ All dependencies installed (`npm ci`)

## Version Management

The project uses automated version management to keep Android version codes in sync with package.json versions.

### How Version Codes Work

- **Package.json version**: `1.9.0` (semantic versioning)
- **Android versionCode**: `10900` (computed: major*10000 + minor*100 + patch)
- **Android versionName**: `"1.9.0"` (matches package.json)

### Version Sync Commands

```bash
# Check if versions are in sync
npm run android:version:check

# Auto-fix version mismatches
npm run android:version:check -- --fix

# Sync native files after version changes
npm run android:prebuild:ci
```

### Manual Version Updates

1. Update version in `package.json`
2. Run `npm run android:version:check -- --fix`
3. Commit changes with conventional commit: `feat: bump version to 1.9.0`

## Keystore Setup

### Production Keystore Creation

**⚠️ IMPORTANT: Never commit production keystores to git!**

1. Generate a production keystore:

```bash
keytool -genkey -v -keystore android/app/release.keystore \
  -alias ultimate-sudoku-key \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

2. Create `android/gradle.properties` (if not exists) and add:

```properties
# Production keystore configuration
RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=ultimate-sudoku-key
RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

3. Update `android/app/build.gradle` to include production signing:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file(RELEASE_STORE_FILE)
        storePassword RELEASE_STORE_PASSWORD
        keyAlias RELEASE_KEY_ALIAS
        keyPassword RELEASE_KEY_PASSWORD
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release
        shrinkResources true
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        crunchPngs true
    }
}
```

### Keystore Security

- Store keystore passwords securely (password manager, CI secrets)
- Backup keystore file to secure location
- Document keystore details for team access
- Never share keystore files or passwords in chat/email

## Building the App

### Development Build

```bash
# Start Metro bundler
npm run android

# Or build and install on device
npx expo run:android
```

### Release Build

```bash
# Clean previous builds
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (recommended for Play Store)
./gradlew bundleRelease
```

### Build Outputs

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

### Build Verification

```bash
# Verify APK signature
jarsigner -verify -verbose -certs app-release.apk

# Check APK contents
aapt dump badging app-release.apk
```

## Google Play Console Setup

### Initial Setup

1. **Create App**: Go to [Google Play Console](https://play.google.com/console)
2. **App Details**: Fill in app name, description, category
3. **Content Rating**: Complete content rating questionnaire
4. **App Access**: Set up internal testing, closed testing, or open testing
5. **Store Listing**: Add screenshots, feature graphic, description

### Required Assets

- **App Icon**: 512x512 PNG (transparent background)
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: 16:9 ratio, minimum 320px width
- **App Description**: Compelling description with keywords
- **Privacy Policy**: URL to privacy policy (required)

### App Signing

1. **Upload Key**: Use your production keystore for initial upload
2. **Play App Signing**: Enable Google Play App Signing (recommended)
3. **Key Upgrade**: If enabled, Google will manage app signing keys

## Release Process

### Release Tracks

1. **Internal Testing** → Team members only
2. **Closed Testing** → Limited external testers
3. **Open Testing** → Public beta testing
4. **Production** → Public release

### Internal Testing Release

1. **Upload Build**: Drag AAB file to internal testing track
2. **Test Notes**: Add release notes for testers
3. **Add Testers**: Include team members and stakeholders
4. **Review & Rollout**: Review and start rollout

### Production Release

1. **Create Release**: Go to production track
2. **Upload Build**: Upload signed AAB file
3. **Release Notes**: Add public release notes
4. **Review Process**: Submit for Google review
5. **Rollout**: Gradual rollout (recommended) or full release

### Release Checklist

- [ ] Version codes updated and synced
- [ ] Release build generated and tested
- [ ] Release notes written
- [ ] Screenshots updated (if UI changes)
- [ ] Privacy policy current
- [ ] Content rating accurate
- [ ] App signing configured
- [ ] Internal testing completed

## Automated Deployment

### CI/CD Integration

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "android:build:release": "cd android && ./gradlew bundleRelease",
    "android:build:apk": "cd android && ./gradlew assembleRelease",
    "android:deploy:internal": "npm run android:build:release && echo 'Upload AAB to Play Console Internal Testing'"
  }
}
```

### GitHub Actions (Optional)

Create `.github/workflows/android-release.yml`:

```yaml
name: Android Release Build
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run android:prebuild:ci
      - run: npm run android:build:release
      - uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/
```

## Troubleshooting

### Common Build Issues

**Version Mismatch**

```bash
# Error: versionCode mismatch
npm run android:version:check -- --fix
```

**Keystore Issues**

```bash
# Error: keystore not found
# Ensure keystore file exists and path is correct in gradle.properties
ls -la android/app/*.keystore
```

**Gradle Build Failures**

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

**Metro Bundler Issues**

```bash
# Clear Metro cache
npx expo start --clear
```

### Play Console Issues

**Upload Rejected**

- Check APK/AAB signature
- Verify version code is higher than previous
- Ensure all required metadata is complete

**Review Delays**

- Common during app updates
- Ensure no policy violations
- Check app content matches description

## Security Best Practices

1. **Never commit keystores** to version control
2. **Use strong passwords** for keystore files
3. **Limit keystore access** to essential team members
4. **Backup keystores** securely
5. **Rotate keys** periodically if possible
6. **Monitor Play Console** for security alerts

## Support Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [React Native Deployment](https://reactnative.dev/docs/signed-apk-android)
- [Expo Build Documentation](https://docs.expo.dev/build/setup/)

---

**Last Updated**: $(date)
**Maintainer**: Development Team
**Next Review**: Quarterly
