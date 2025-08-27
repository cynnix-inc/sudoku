# iOS Deployment Quick Reference

## Essential Commands

### Version Management

```bash
# Check version sync
npm run android:version:check

# Fix version mismatches
npm run android:version:check -- --fix

# Sync native files
npm run native:prebuild
```

### Building

```bash
# Development build
npm run ios

# Prebuild for Xcode
npm run native:prebuild

# Open in Xcode
open ios/ultimate-sudoku.xcworkspace
```

### Build Process

1. **Prebuild**: `npm run native:prebuild`
2. **Open Xcode**: `open ios/ultimate-sudoku.xcworkspace`
3. **Archive**: Product → Archive
4. **Upload**: Use Organizer to upload to App Store Connect

## Release Checklist

- [ ] `npm run android:version:check` passes
- [ ] `npm run native:prebuild` completed
- [ ] Xcode project opens without errors
- [ ] Archive build succeeds
- [ ] Upload to App Store Connect
- [ ] TestFlight testing completed
- [ ] App Store review submitted

## Common Issues

| Issue            | Solution                                 |
| ---------------- | ---------------------------------------- |
| Version mismatch | `npm run android:version:check -- --fix` |
| Build fails      | Clean build folder in Xcode              |
| Code signing     | Check team selection and certificates    |
| Metro issues     | `npx expo start --clear`                 |

## Quick Deploy

```bash
# Full release process
npm run android:version:check -- --fix
npm run native:prebuild
open ios/ultimate-sudoku.xcworkspace
echo "Archive in Xcode and upload to App Store Connect"
```

## App Store Assets Required

- **App Icon**: 1024x1024 PNG
- **Screenshots**: 6.7", 6.5", 5.5", 12.9" iPad Pro
- **App Description**: Compelling description with keywords
- **Privacy Policy**: URL (required)
- **App Preview Videos**: 15-30 seconds (optional)

## TestFlight Workflow

1. **Internal Testing** → Team members
2. **External Testing** → Limited external testers
3. **Beta App Review** → Apple approval for external testing
4. **Production** → App Store release

---

**See full guide**: [ios-deployment.md](./ios-deployment.md)
