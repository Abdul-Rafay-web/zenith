# Zenith — shipping guide

## Architecture
- **Web app** (Vite + React) → `dist/`, wrapped by **Capacitor** into a native Android app (`android/`).
- **Firestore**: per-user data under `users/{uid}/…`, enforced by `firestore.rules`.
- **Offline outbox** (`src/lib/syncQueue.ts`): every change is diffed and queued in localStorage, then flushed in batches when online, with exponential backoff. Deletes are tombstoned, so a stale cloud copy can't bring them back.
- **Server authority** (`functions/`): `verifySkillProgress` replays `src/lib/mastery.ts` on every skill write and corrects XP, level and review dates. `onUserDeleted` wipes all data. `pruneDiagnostics` trims crash reports.

## One-time setup (needs you)
1. **Blaze plan**: Cloud Functions require pay-as-you-go. This app's usage is well within the free tier.
2. Deploy backend: `npm i -g firebase-tools && firebase login && firebase deploy --only firestore,functions`
3. **App Check**: Firebase Console → App Check → register the web app with reCAPTCHA Enterprise and put the site key in `VITE_APPCHECK_SITE_KEY`. Add `localhost` to the key's domains (the Android WebView serves from `https://localhost`). Turn on **enforcement** for Firestore only after confirming requests show as verified.
4. **Analytics** (optional): set `VITE_FIREBASE_MEASUREMENT_ID`.
5. **Legal**: edit `LEGAL` in `src/components/Legal.tsx` (operator name, contact email, jurisdiction).

## Building the APK
**Automatic:** push this repo to GitHub. `.github/workflows/android.yml` runs typecheck, tests and build, then uploads a debug APK as an artifact.
For a signed release APK + AAB (Play Store), add these secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

```
keytool -genkey -v -keystore zenith.jks -alias zenith -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 zenith.jks   # → ANDROID_KEYSTORE_BASE64
```
Keep the keystore safe. Losing it means you can never update the app on Play.

**Local** (Android Studio installed): `pnpm android:sync && pnpm android:open`, then Run.

## Google sign-in on Android
Firebase's popup flow can't run inside a WebView, so the Google button is hidden on native and email sign-in works. To enable native Google sign-in:
add `@capacitor-firebase/authentication`, register the app's SHA-1 in Firebase, and put `google-services.json` in `android/app/`.
