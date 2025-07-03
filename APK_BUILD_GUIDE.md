# StockSphere APK Build Guide

## Quick APK Build Options

### Option 1: Expo Application Services (EAS) - Recommended

1. **Install EAS CLI**
```bash
npm install -g eas-cli
# or if that fails:
npm install -g @expo/cli
```

2. **Login to Expo**
```bash
npx eas login
```

3. **Configure Build for APK**
The project is already configured to build APK files. The `eas.json` file contains:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

4. **Build APK**
```bash
npx eas build:configure
```

4. **Build APK**
```bash
npx eas build --platform android --profile preview
```

### Option 2: Expo Development Build

1. **Install Expo CLI**
```bash
npm install -g @expo/cli
```

2. **Install development client**
```bash
npx expo install expo-dev-client
```

3. **Build locally**
```bash
npx expo run:android
```

### Option 3: Manual Build with Android Studio

1. **Generate native code**
```bash
npx expo eject
```

2. **Open Android Studio**
- Open the `android` folder in Android Studio
- Let it sync and download dependencies

3. **Build APK**
- Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK will be generated in `android/app/build/outputs/apk/`

### Option 4: Command Line Gradle Build

1. **Eject first (if not done)**
```bash
npx expo eject
```

2. **Build with Gradle**
```bash
cd android
./gradlew assembleRelease
```

3. **Find APK**
```bash
# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### EAS CLI Installation Issues
If you get package not found errors:
```bash
# Try these alternatives:
npm install -g @expo/cli@latest
npm install -g expo-cli
yarn global add @expo/cli
```

### Build Errors
1. **Clean and reinstall**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Update Expo SDK**
```bash
npx expo install --fix
```

3. **Check app.json configuration**
- Ensure bundle identifier is unique
- Verify version numbers
- Check platform compatibility

### Common Issues

**"Command not found: eas"**
- Make sure PATH includes npm global bin directory
- Try using `npx eas` instead of `eas`

**"Not logged in"**
- Run `npx eas login` or `expo login`
- Create free Expo account if needed

**"Build failed"**
- Check logs in Expo dashboard
- Verify all dependencies are properly installed
- Try building with `--clear-cache` flag

## Download Your APK

After successful build:
1. Check your email for build completion notification
2. Visit [Expo Dashboard](https://expo.dev/accounts/[username]/projects/stocksphere/builds)
3. Download APK from the builds page
4. Install on Android device (enable "Install from unknown sources")

## Build Profiles

The app includes these build profiles (in `eas.json`):

- **preview**: APK for testing (faster build)
- **production**: AAB for Google Play Store
- **development**: Development build with debugging

Choose the right profile for your needs!
