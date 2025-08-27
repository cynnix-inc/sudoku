# Android Deployment Quick Reference

## Essential Commands

### Version Management

```bash
# Check version sync
npm run android:version:check

# Fix version mismatches
npm run android:version:check -- --fix

# Sync native files
npm run android:prebuild:ci
```

### Building

```bash
# Development build
npm run android

# Release APK
npm run android:build:apk

# Release AAB (Play Store)
npm run android:build:release

# Clean builds
npm run android:clean
```

### Build Locations

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## Release Checklist

- [ ] `npm run android:version:check` passes
- [ ] `npm run android:build:release` succeeds
- [ ] Test AAB on device/emulator
- [ ] Upload to Play Console Internal Testing
- [ ] Complete internal testing
- [ ] Promote to Production track

## Common Issues

| Issue            | Solution                                                 |
| ---------------- | -------------------------------------------------------- |
| Version mismatch | `npm run android:version:check -- --fix`                 |
| Build fails      | `npm run android:clean && npm run android:build:release` |
| Keystore error   | Check `android/gradle.properties` and keystore file      |
| Metro issues     | `npx expo start --clear`                                 |

## Quick Deploy

```bash
# Full release process
npm run android:version:check -- --fix
npm run android:build:release
echo "Upload app-release.aab to Play Console"
```

---

**See full guide**: [android-deployment.md](./android-deployment.md)
