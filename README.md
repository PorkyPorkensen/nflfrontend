# NFL Frontend to Android App (Capacitor)

This repo now has Capacitor set up so your existing React + Vite site can run as an Android app.

## What Is Already Done

- Capacitor dependencies installed
- Capacitor initialized (`capacitor.config.json`)
- Android platform created in `android/`
- Useful scripts added to `package.json`

## Scripts You Can Use

- `npm run dev`: run website locally in browser
- `npm run build`: build production web assets to `dist/`
- `npm run assets:android`: generate Android icon/splash resources from `assets/`
- `npm run branding:sync`: regenerate branding assets, then build+sync Android web assets
- `npm run android:sync`: rebuild web app and copy it into Android project
- `npm run android:open`: open native Android project in Android Studio
- `npm run android:run`: sync + run on connected emulator/device

## First-Time Setup (One Time)

1. Install Android Studio.
2. In Android Studio, install:
   - Android SDK
   - Android SDK Platform tools
   - Android Emulator
3. Set environment variables on Windows (if Android Studio did not auto-configure):
   - `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) points to your SDK path
   - Add `platform-tools` to your `PATH`

## Local Android Workflow

1. Build and sync your web app into Android:

```bash
npm run android:sync
```

2. Open Android project:

```bash
npm run android:open
```

3. In Android Studio:
   - Wait for Gradle sync
   - Create/select an emulator (or plug in a phone with USB debugging)
   - Press Run

## Everyday Development Loop

When you change React code:

1. `npm run android:sync`
2. Run again from Android Studio

Capacitor wraps your web app, so your UI logic stays in React while Android Studio builds and signs the APK/AAB.

## Before Play Store

1. Update app identity and branding.
   - App name and package ID are set in `capacitor.config.json` and Android project files.
2. Add app icons and splash assets.
3. Test on at least one physical Android device.
4. Build signed release bundle (`.aab`) in Android Studio.
5. Create Google Play Console account and upload the bundle.

## Branding (Step 2)

1. Put your logo source file in `assets/logo.png` (or `assets/icon.png`).
2. Run `npm run branding:sync`.
3. Reopen or rerun the app in Android Studio to confirm icon/splash updates.

More details are in `assets/README.md`.

## Important Note About Current Node Version

You are on Node `22.11.0`, and Vite reports it wants `22.12+` (or `20.19+`).
Builds still worked, but upgrading Node will avoid warning noise and future breakage.

## Suggested Next Step

Start Android Studio with `npm run android:open`, run the app in an emulator once, then we can do the next round together:

1. Native app icon/splash setup
2. Offline behavior and loading polish
3. Signed release build and Play Store checklist
