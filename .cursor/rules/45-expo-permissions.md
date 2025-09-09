# Expo Permissions — Guidance and Defaults

When to use: Any feature touching camera, media library, notifications, location, contacts, or background tasks.

Principles

- Request the minimum permission at the moment of use (just-in-time), never at app start.
- Explain the why: user-facing rationale must be clear and contextual.
- Handle denied and limited responses gracefully with alternative flows.
- Keep platform config (Android/iOS) and translations synced with code.

Expo Config

- Add only required permissions in `app.json`/`app.config.ts` and conditionally per platform.
- Document each permission with a short rationale and linked code owner.
- For Android: include `android.permissions` entries; avoid broad permissions.
- For iOS: include `ios.infoPlist` usage keys (e.g., `NSCameraUsageDescription`).

Testing

- Mock permission APIs in unit tests; avoid real prompts.
- Use MSW/fakes for network side-effects triggered after granting.
- Add regression tests for denied/limited states.

Example (pseudo)

```ts
import * as ImagePicker from 'expo-image-picker';

export async function pickAvatar(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null; // Show guidance UI upstream
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  return result.canceled || !result.assets?.length ? null : result.assets[0].uri;
}
```

CI Expectations

- Lint config and PR descriptions must list any new permissions and rationale.
- Warn on adding unused permission entries.

References

- Expo Permissions: `https://docs.expo.dev/versions/latest/sdk/`
