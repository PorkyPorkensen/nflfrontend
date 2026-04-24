# Branding Assets

Put branding source files in this folder, then run:

```bash
npm run branding:sync
```

## Easy Mode (recommended)

Use one image file:

- `assets/logo.png` (or `assets/icon.png`)
- Recommended size: at least 1024x1024 PNG
- Keep a transparent background for best adaptive icon results

`npm run branding:sync` will generate Android launcher icons and splash resources, then sync them into the native app.

## Optional Dark Variant

You can also provide:

- `assets/logo-dark.png`

## Full Control Mode (optional)

If you want precise control, provide these files instead:

- `assets/icon-only.png`
- `assets/icon-foreground.png`
- `assets/icon-background.png`
- `assets/splash.png`
- `assets/splash-dark.png`

Recommended splash source size: at least 2732x2732 PNG.

## Typical Workflow

1. Update the source image(s) in `assets/`.
2. Run `npm run branding:sync`.
3. Open Android Studio and run again.
