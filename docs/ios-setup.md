### iOS setup (macOS)

- Install Xcode (latest stable) from the App Store
- Open Xcode once to finish installation
- Install Command Line Tools: Xcode → Settings → Locations → select latest Command Line Tools
- Install CocoaPods (if not present): `sudo gem install cocoapods`
- Create a simulator: Xcode → Window → Devices and Simulators → Simulators → + → iPhone 15 (or similar)
- Start the simulator at least once

Run the app:
```bash
npm run ios
```

Troubleshooting:
- If Metro or build fails after dependency changes: `watchman watch-del-all && rm -rf $TMPDIR/metro-* && rm -rf node_modules && npm ci`
- If iOS native modules fail: run `npm run native:prebuild` then `npm run ios`


