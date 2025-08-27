# Deployment Overview

This document provides a high-level overview of the deployment strategy for Ultimate Sudoku across all platforms.

## Platform Deployment Status

| Platform    | Status             | Documentation                                    | Key Requirements               |
| ----------- | ------------------ | ------------------------------------------------ | ------------------------------ |
| **Web**     | ✅ Production      | Netlify auto-deploy                              | Node 20.x, build passes        |
| **Android** | 🚧 Ready for setup | [android-deployment.md](./android-deployment.md) | Google Play Console, keystore  |
| **iOS**     | 🚧 Ready for setup | [ios-deployment.md](./ios-deployment.md)         | Apple Developer Program, Xcode |

## Deployment Architecture

### Version Management

- **Single source of truth**: `package.json` version
- **Automated sync**: Android version codes and iOS build numbers
- **Script**: `npm run android:version:check -- --fix`

### Build Process

```
package.json version →
├── Android: versionCode (major*10000 + minor*100 + patch)
├── iOS: buildNumber (same as Android)
└── Web: version string
```

### Release Workflow

1. **Version bump** in `package.json`
2. **Sync native versions** with `npm run android:version:check -- --fix`
3. **Prebuild native projects** with `npm run native:prebuild`
4. **Build and deploy** each platform

## Platform-Specific Details

### Web (Netlify)

- **Auto-deploy**: On push to `main` branch
- **Preview**: On pull requests
- **Build command**: `npm run build`
- **Output**: `dist/` directory

### Android (Google Play)

- **Build command**: `npm run android:build:release`
- **Output**: AAB file for Play Store
- **Deployment**: Manual upload to Play Console
- **Testing**: Internal → Closed → Open → Production

### iOS (App Store)

- **Build command**: Archive in Xcode
- **Output**: IPA file for App Store
- **Deployment**: Manual upload via Xcode Organizer
- **Testing**: TestFlight Internal → External → App Store

## Quick Deploy Commands

### All Platforms

```bash
# Version sync
npm run android:version:check -- --fix

# Native prebuild
npm run native:prebuild

# Web build
npm run build

# Android build
npm run android:build:release

# iOS (manual in Xcode)
npm run ios:open
```

### Platform-Specific

```bash
# Android only
npm run android:build:release

# iOS only
npm run ios:open

# Web only
npm run build
```

## CI/CD Integration

### GitHub Actions

- **Web**: Auto-deploy on push to main
- **Android**: Build on tags (optional)
- **iOS**: Prebuild on tags (optional)

### Manual Steps Required

- **Android**: Upload AAB to Play Console
- **iOS**: Archive and upload via Xcode
- **Web**: Automatic via Netlify

## Security Considerations

### Android

- **Keystore**: Never commit to git
- **Passwords**: Store securely (CI secrets)
- **Backup**: Secure keystore backup

### iOS

- **Certificates**: Store in Keychain
- **Provisioning**: Keep profiles updated
- **Team access**: Limit to essential members

### Web

- **Environment variables**: Secure in Netlify
- **API keys**: Never expose in client code

## Release Checklist

### Pre-Release

- [ ] Version bumped in `package.json`
- [ ] Native versions synced
- [ ] Tests passing
- [ ] Build successful on all platforms

### Android Release

- [ ] AAB built successfully
- [ ] Uploaded to Play Console
- [ ] Internal testing completed
- [ ] Production release created

### iOS Release

- [ ] Archive built successfully
- [ ] Uploaded to App Store Connect
- [ ] TestFlight testing completed
- [ ] App Store review submitted

### Web Release

- [ ] Netlify deploy successful
- [ ] Lighthouse scores acceptable
- [ ] Cross-browser testing completed

## Monitoring & Rollback

### Web

- **Rollback**: Revert to previous commit
- **Monitoring**: Netlify analytics, Lighthouse CI

### Android

- **Rollback**: Unpublish in Play Console
- **Monitoring**: Play Console analytics, crash reports

### iOS

- **Rollback**: Remove from sale in App Store Connect
- **Monitoring**: App Store Connect analytics, TestFlight feedback

## Support & Resources

- **Android**: [android-deployment.md](./android-deployment.md)
- **iOS**: [ios-deployment.md](./ios-deployment.md)
- **Web**: Netlify documentation
- **General**: [CONTRIBUTING.md](../CONTRIBUTING.md)

## Tracking

### Android Deployment Epic

- **Epic #324**: [Android App Deployment & Publishing](https://github.com/cynnix-inc/sudoku/issues/324)
- **Key Issues**:
  - #323: Missing deobfuscation file for R8/proguard obfuscation

---

**Last Updated**: $(date)
**Maintainer**: Development Team
**Next Review**: Quarterly
