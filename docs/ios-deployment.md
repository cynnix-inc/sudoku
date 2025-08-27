# iOS App Deployment Guide

This guide covers the complete process of building, signing, and deploying the Ultimate Sudoku iOS app to the App Store and TestFlight.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Version Management](#version-management)
3. [Code Signing Setup](#code-signing-setup)
4. [Building the App](#building-the-app)
5. [App Store Connect Setup](#app-store-connect-setup)
6. [TestFlight Distribution](#testflight-distribution)
7. [App Store Release](#app-store-release)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ macOS with latest Xcode installed (see [ios-setup.md](./ios-setup.md))
- ✅ Apple Developer Program membership ($99/year)
- ✅ App Store Connect access
- ✅ Code signing certificates and provisioning profiles
- ✅ Node.js 20.x (managed by Volta)
- ✅ All dependencies installed (`npm ci`)

## Version Management

The project uses automated version management to keep iOS build numbers in sync with package.json versions.

### How Build Numbers Work

- **Package.json version**: `1.9.0` (semantic versioning)
- **iOS buildNumber**: `10900` (computed: major*10000 + minor*100 + patch)
- **iOS version**: `"1.9.0"` (matches package.json)

### Version Sync Commands

```bash
# Check if versions are in sync
npm run android:version:check

# Fix version mismatches
npm run android:version:check -- --fix

# Sync native files after version changes
npm run native:prebuild
```

### Manual Version Updates

1. Update version in `package.json`
2. Run `npm run android:version:check -- --fix`
3. Run `npm run native:prebuild` to sync iOS files
4. Commit changes with conventional commit: `feat: bump version to 1.9.0`

## Code Signing Setup

### Apple Developer Program Setup

1. **Enroll in Apple Developer Program** at [developer.apple.com](https://developer.apple.com)
2. **Create App ID** in Developer Portal:
   - Bundle ID: `com.ultimatesudoku.app`
   - Capabilities: Enable required features (Push Notifications, etc.)

### Code Signing Certificates

#### Development Certificate

```bash
# Create development certificate (Xcode handles this automatically)
# Xcode → Preferences → Accounts → Your Apple ID → Manage Certificates → +
```

#### Distribution Certificate

```bash
# Create distribution certificate for App Store
# Xcode → Preferences → Accounts → Your Apple ID → Manage Certificates → +
# Choose "Apple Distribution" certificate type
```

### Provisioning Profiles

#### Development Profile

- **Type**: iOS App Development
- **App ID**: `com.ultimatesudoku.app`
- **Devices**: Include your test devices
- **Certificate**: Development certificate

#### Distribution Profile

- **Type**: App Store
- **App ID**: `com.ultimatesudoku.app`
- **Certificate**: Distribution certificate
- **Devices**: No devices needed (App Store distribution)

### Xcode Project Configuration

1. **Open project in Xcode**:

```bash
npm run native:prebuild
open ios/ultimate-sudoku.xcworkspace
```

2. **Configure signing**:
   - Select project → Target → Signing & Capabilities
   - **Team**: Select your Apple Developer Team
   - **Bundle Identifier**: `com.ultimatesudoku.app`
   - **Automatically manage signing**: ✅ (recommended)

## Building the App

### Development Build

```bash
# Start Metro bundler and run on simulator
npm run ios

# Or build and install on device
npx expo run:ios
```

### Archive Build for Distribution

1. **Open in Xcode**:

```bash
npm run native:prebuild
open ios/ultimate-sudoku.xcworkspace
```

2. **Select device**: Choose "Any iOS Device (arm64)" as target

3. **Archive**:
   - Product → Archive
   - Wait for build to complete
   - Organizer window opens automatically

### Build Verification

```bash
# Verify app bundle
xcrun simctl install booted /path/to/your/app.app

# Check app info
xcrun simctl launch booted com.ultimatesudoku.app
```

## App Store Connect Setup

### Initial App Creation

1. **Create App**: Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **App Information**: Fill in app name, bundle ID, SKU
3. **App Store Information**: Complete required metadata
4. **Pricing**: Set price and availability

### Required App Store Assets

- **App Icon**: 1024x1024 PNG (no transparency)
- **App Preview Videos**: 15-30 seconds, various device sizes
- **Screenshots**: 6.7", 6.5", 5.5", 12.9" iPad Pro
- **App Description**: Compelling description with keywords
- **Privacy Policy**: URL to privacy policy (required)
- **App Store Review Information**: Contact details for review team

### App Store Review Guidelines

- **Content**: Ensure app follows [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Metadata**: Accurate app description and screenshots
- **Functionality**: App must work as described
- **Privacy**: Clear privacy policy and data usage

## TestFlight Distribution

### Internal Testing

1. **Upload Build**: Use Xcode Organizer to upload archive
2. **Add Internal Testers**: Team members and stakeholders
3. **Test Notes**: Add release notes for testers
4. **Start Testing**: Begin internal testing phase

### External Testing

1. **Create External Testing Group**: Add external testers
2. **Upload Build**: Upload new build for external testing
3. **Beta App Review**: Submit for Apple's beta review
4. **Invite Testers**: Send TestFlight invitations

### TestFlight Best Practices

- **Regular Updates**: Upload builds weekly during active development
- **Test Notes**: Clear, actionable feedback for testers
- **Crash Reports**: Monitor crash reports and fix issues
- **Feedback**: Collect and act on tester feedback

## App Store Release

### Pre-Release Checklist

- [ ] App thoroughly tested on TestFlight
- [ ] All critical bugs fixed
- [ ] App Store metadata complete and accurate
- [ ] Screenshots updated and high quality
- [ ] Privacy policy current and accessible
- [ ] App follows App Store guidelines
- [ ] Version and build numbers updated

### Submit for Review

1. **Create Release**: Go to App Store → Prepare for Submission
2. **Upload Build**: Select latest approved TestFlight build
3. **Release Notes**: Add public release notes
4. **Submit for Review**: Submit to Apple for review

### Review Process

- **Timeline**: 1-7 days typically
- **Common Issues**: Metadata problems, guideline violations
- **Rejection Handling**: Address issues and resubmit
- **Approval**: App goes live or enters "Ready for Sale" state

### Release Options

- **Automatic Release**: App goes live immediately after approval
- **Manual Release**: You control when app goes live
- **Phased Release**: Gradual rollout to users (recommended)

## Automated Deployment

### CI/CD Integration

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "ios:prebuild": "npx expo prebuild -p ios",
    "ios:build:archive": "echo 'Open Xcode and archive manually'",
    "ios:deploy:testflight": "npm run ios:prebuild && echo 'Archive in Xcode and upload to TestFlight'"
  }
}
```

### GitHub Actions (Optional)

Create `.github/workflows/ios-release.yml`:

```yaml
name: iOS Release Build
on:
  push:
    tags:
      - 'v*'

jobs:
  prebuild:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run ios:prebuild
      - uses: actions/upload-artifact@v4
        with:
          name: ios-project
          path: ios/
```

## Troubleshooting

### Common Build Issues

**Code Signing Errors**

```bash
# Error: No provisioning profile found
# Solution: Check Xcode signing configuration and team selection
```

**Archive Failures**

```bash
# Error: Archive failed
# Solution: Clean build folder and try again
# Xcode → Product → Clean Build Folder
```

**Simulator Issues**

```bash
# Error: Simulator not working
# Solution: Reset simulator
# iOS Simulator → Device → Erase All Content and Settings
```

**Metro Bundler Issues**

```bash
# Clear Metro cache
watchman watch-del-all
rm -rf $TMPDIR/metro-*
npx expo start --clear
```

### App Store Connect Issues

**Upload Rejected**

- Check bundle identifier matches App Store Connect
- Verify code signing is correct
- Ensure app version is higher than previous

**Review Delays**

- Common during busy periods
- Ensure no policy violations
- Check app content matches description

**TestFlight Issues**

- Verify external testing group is approved
- Check beta app review status
- Ensure build is compatible with test devices

## Security Best Practices

1. **Secure Code Signing**: Never share private keys or certificates
2. **Provisioning Profiles**: Keep profiles up to date
3. **App Transport Security**: Use HTTPS for all network requests
4. **Privacy**: Follow Apple's privacy guidelines
5. **Keychain Access**: Secure sensitive data storage
6. **Code Obfuscation**: Consider using ProGuard for release builds

## Support Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Expo iOS Build Documentation](https://docs.expo.dev/build/setup/)

---

**Last Updated**: $(date)
**Maintainer**: Development Team
**Next Review**: Quarterly
