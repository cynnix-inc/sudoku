## EAS and Updates

Profiles in `eas.json`:

- development: channel `development`, development client enabled
- preview: channel `preview`
- production: channel `production`

Common commands:

```bash
# Publish a preview update from any branch
eas update --branch preview --message "Testing preview"

# Promote to production
eas update --branch production --message "Promote to production"
```

# Ultimate Sudoku App

Expo app scaffold with Expo Router v5, NativeWind, and RN Web.


