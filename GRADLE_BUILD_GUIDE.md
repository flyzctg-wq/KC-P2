# 📱 Kunjachaya Club — Android Gradle & Keystore Guide (GRADLE_BUILD_GUIDE.md)

> Focused guide for building, signing, debugging, and packaging the **Kunjachaya Club Android Application** using Capacitor, Gradle, and Android SDK Build Tools.

---

## 📋 Table of Contents
- [1. Android Prerequisites](#1-android-prerequisites)
- [2. Capacitor Android Architecture](#2-capacitor-android-architecture)
- [3. Keystore Generation & Secret Setup](#3-keystore-generation--secret-setup)
- [4. Local Command-Line Build](#4-local-command-line-build)
- [5. Building via Android Studio GUI](#5-building-via-android-studio-gui)
- [6. Zipalign & Apksigner Signing](#6-zipalign--apksigner-signing)
- [7. GitHub Actions CI/CD Pipeline](#7-github-actions-cicd-pipeline)

---

## 1. Android Prerequisites

- **Java JDK**: Version 17 (OpenJDK 17 recommended)
- **Android SDK**: `Platform 34` (Android 14)
- **Android Build Tools**: Version `34.0.0` or higher (includes `zipalign` and `apksigner`)
- **Capacitor CLI**: `v6.x`

---

## 2. Capacitor Android Architecture

```
kunjachaya-mobile/
├── capacitor.config.json    # Capacitor configuration
│   ├── appId: "club.kunjachaya.app"
│   ├── appName: "Kunjachaya Club"
│   └── webDir: "dist"
├── android/                 # Android Native Gradle Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/club/kunjachaya/app/MainActivity.java
│   │   │   └── res/         # App icons & drawables
│   │   └── build.gradle
│   ├── build.gradle
│   ├── gradle.properties
│   └── gradlew / gradlew.bat
```

---

## 3. Keystore Generation & Secret Setup

### Generating a Production Keystore:
```bash
keytool -genkey -v \
  -keystore kunjachaya.keystore \
  -alias kunjachaya \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass kunjachaya123 -keypass kunjachaya123 \
  -dname "CN=Kunjachaya Club, OU=Mobile, O=Kunjachaya, L=Chattogram, C=BD"
```

### Base64 Encoding for GitHub Secrets:
```bash
# macOS / Linux
base64 -i kunjachaya.keystore | tr -d '\n'

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("kunjachaya.keystore"))
```

Add this string to **GitHub Repo → Settings → Secrets and variables → Actions → `KEYSTORE_BASE64`**.

---

## 4. Local Command-Line Build

```bash
cd kunjachaya-mobile

# 1. Build Vite web assets
npm run build

# 2. Sync to Android project
npx cap sync android

# 3. Compile release APK with Gradle Wrapper
cd android
./gradlew assembleRelease --no-daemon
```

Unsigned APK will be generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 5. Building via Android Studio GUI

1. Open **Android Studio**.
2. Select **Open** → Choose `f:/OMEGA NET/KC P2/kunjachaya-mobile/android`.
3. Wait for Gradle Sync to complete.
4. Go to **Build → Generate Signed Bundle / APK**.
5. Select **APK**, choose your keystore, select release build type, and click **Finish**.

---

## 6. Zipalign & Apksigner Signing

```bash
# Step 1: Align APK (4-byte alignment)
zipalign -v -p 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  kunjachaya-aligned.apk

# Step 2: Sign with apksigner (v2/v3 signing scheme)
apksigner sign \
  --ks android/app/kunjachaya.keystore \
  --ks-key-alias kunjachaya \
  --ks-pass pass:kunjachaya123 \
  --key-pass pass:kunjachaya123 \
  --out Kunjachaya-Club.apk \
  kunjachaya-aligned.apk

# Step 3: Verify APK signature
apksigner verify --verbose Kunjachaya-Club.apk
```

---

## 7. GitHub Actions CI/CD Pipeline

The workflow at `.github/workflows/android-build.yml` runs automatically whenever code is pushed to `main`.

### Workflow Stages:
1. **Setup**: Configures Node.js 20, Java 17, and Android SDK 34.
2. **Web Build**: Runs `npm ci` and `npm run build`.
3. **Capacitor Sync**: Executes `npx cap sync android`.
4. **Keystore Integrity Check**: Decodes `KEYSTORE_BASE64` secret and validates it with `keytool -list`. If the secret is corrupt or absent, it falls back to a clean `keytool -genkey` execution.
5. **Gradle Compile**: Runs `./gradlew assembleRelease`.
6. **Signing**: Runs `zipalign` and `apksigner sign --ks-key-alias kunjachaya`.
7. **Release Publishing**: Attaches `Kunjachaya-Club.apk` to a versioned **GitHub Release**.
