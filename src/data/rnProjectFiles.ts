import { RNFileDefinition } from '../types';

export const RN_PROJECT_FILES: RNFileDefinition[] = [
  {
    path: '.github/workflows/android-apk.yml',
    filename: 'android-apk.yml',
    folder: '.github/workflows',
    category: 'config',
    description: 'Complete GitHub Actions YAML workflow to validate TypeScript, setup Java 17 + Android SDK + Gradle 8.6, sign keystore, compile Debug & Release APKs, and publish to GitHub Releases',
    content: `name: Build Android APK (GitHub Actions)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  typecheck:
    name: TypeScript & Code Validation
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install Node dependencies
        run: npm ci || npm install --legacy-peer-deps

      - name: 🔍 Run TypeScript Compiler Check
        run: npx tsc --noEmit

  build-android-apk:
    name: Build Android APK (Gradle)
    needs: typecheck
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: ☕ Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 🤖 Setup Android SDK (API 34)
        uses: android-actions/setup-android@v3

      - name: 🐘 Setup Gradle 8.6
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.6'

      - name: 📦 Install Node dependencies
        run: npm ci || npm install --legacy-peer-deps

      - name: 🛠️ Ensure Android Manifest Permissions & Debug Keystore
        run: |
          node scripts/configure-android.js
          if [ ! -f "android/app/debug.keystore" ]; then
            keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
          fi

      - name: 🔨 Build Debug & Release APKs
        run: |
          cd android
          gradle assembleDebug assembleRelease --no-daemon

      - name: 📤 Upload Debug APK to Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ImageResizerPro-Debug-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30

      - name: 📤 Upload Release APK to Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ImageResizerPro-Release-APK
          path: android/app/build/outputs/apk/release/app-release.apk
          retention-days: 30

      - name: 🚀 Publish APKs to GitHub Releases (on main push)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v1.0.\${{ github.run_number }}
          name: Image Resizer Pro v1.0.\${{ github.run_number }}
          body: |
            Automated React Native Android APK build via GitHub Actions (Pure React Native CLI - Zero Expo).
            - \`app-release.apk\` (Production optimized bundle)
            - \`app-debug.apk\` (Debug build)
          files: |
            android/app/build/outputs/apk/release/app-release.apk
            android/app/build/outputs/apk/debug/app-debug.apk
`,
  },
  {
    path: 'scripts/configure-android.js',
    filename: 'configure-android.js',
    folder: 'scripts',
    category: 'util',
    description: 'Automatically injects CAMERA, Gallery/Media permissions, WhatsApp package queries, and app display name into AndroidManifest.xml',
    content: `const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const stringsPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  const permissions = [
    '<uses-permission android:name="android.permission.CAMERA" />',
    '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
    '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
    '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />',
  ];

  permissions.forEach((perm) => {
    const permName = perm.match(/android:name="([^"]+)"/)[1];
    if (!manifest.includes(permName)) {
      manifest = manifest.replace('<application', \`    \${perm}\\n    <application\`);
    }
  });

  // Add <queries> for WhatsApp sharing on Android 11+ (API 30+)
  if (!manifest.includes('com.whatsapp')) {
    const queriesBlock = \`
    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        <intent>
            <action android:name="android.intent.action.SEND" />
            <data android:mimeType="image/*" />
        </intent>
    </queries>
    <application\`;
    manifest = manifest.replace('<application', queriesBlock);
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✅ AndroidManifest.xml configured with Camera, Media & WhatsApp permissions.');
}

if (fs.existsSync(stringsPath)) {
  let stringsXml = fs.readFileSync(stringsPath, 'utf8');
  stringsXml = stringsXml.replace(
    /<string name="app_name">.*<\\/string>/,
    '<string name="app_name">Image Resizer Pro</string>'
  );
  fs.writeFileSync(stringsPath, stringsXml, 'utf8');
  console.log('✅ strings.xml updated with app_name: Image Resizer Pro');
}
`,
  },
  {
    path: '.gitignore',
    filename: '.gitignore',
    folder: 'root',
    category: 'config',
    description: 'React Native CLI Git ignore rules excluding node_modules, Gradle caches, Pods, keystores, and build outputs',
    content: `# OSX / Windows / IDE
.DS_Store
.vscode/
.idea/
*.swp

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Xcode / iOS
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
ios/Pods/
ios/build/

# Android / Gradle
android/app/build/
android/build/
android/.gradle/
android/local.properties
*.apk
*.ap_
*.aab
*.dex
*.class
*.keystore
!debug.keystore

# Metro / React Native
.metro-health-check*
*.jsbundle
npm-debug.*
yarn-debug.*
*.log

# Environment variables
.env
.env*.local
`,
  },
  {
    path: 'package.json',
    filename: 'package.json',
    folder: 'root',
    category: 'config',
    description: 'Pure React Native CLI 0.74.5 dependencies (Zero Expo) with native Android autolinking CLI packages',
    content: `{
  "name": "ImageResizerPro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "lint": "tsc --noEmit",
    "build:apk": "cd android && gradle assembleDebug",
    "build:release": "cd android && gradle assembleRelease",
    "configure:android": "node scripts/configure-android.js"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.5",
    "@bam.tech/react-native-image-resizer": "^3.0.7",
    "@react-native-camera-roll/camera-roll": "^7.4.0",
    "@react-native-community/slider": "^4.5.2",
    "lucide-react-native": "^0.378.0",
    "react-native-fs": "^2.20.0",
    "react-native-image-picker": "^7.1.2",
    "react-native-safe-area-context": "^4.10.1",
    "react-native-share": "^10.2.1",
    "react-native-svg": "^15.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "@babel/runtime": "^7.24.0",
    "@react-native-community/cli": "^13.6.9",
    "@react-native-community/cli-platform-android": "^13.6.9",
    "@react-native/babel-preset": "0.74.85",
    "@react-native/eslint-config": "0.74.85",
    "@react-native/metro-config": "0.74.85",
    "@react-native/typescript-config": "0.74.85",
    "@types/react": "^18.2.6",
    "typescript": "5.0.4"
  },
  "engines": {
    "node": ">=18"
  }
}`,
  },
  {
    path: 'android/build.gradle',
    filename: 'build.gradle',
    folder: 'android',
    category: 'config',
    description: 'Top-level Android Gradle configuration defining SDK versions (API 34), Kotlin 1.9.22, and React Native Gradle plugin',
    content: `buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

apply plugin: "com.facebook.react.rootproject"`,
  },
  {
    path: 'android/settings.gradle',
    filename: 'settings.gradle',
    folder: 'android',
    category: 'config',
    description: 'Gradle settings linking native Android modules (ImageResizer, ImagePicker, CameraRoll, RNFS, Share, SVG)',
    content: `rootProject.name = 'ImageResizerPro'
apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')`,
  },
  {
    path: 'android/gradle.properties',
    filename: 'gradle.properties',
    folder: 'android',
    category: 'config',
    description: 'Gradle JVM memory flags, AndroidX support, and Hermes JS engine configuration',
    content: `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# Use AndroidX libraries
android.useAndroidX=true

# Architecture & JS Engine
newArchEnabled=false
hermesEnabled=true

# Supported ABIs for smaller APK size
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64`,
  },
  {
    path: 'android/gradle/wrapper/gradle-wrapper.properties',
    filename: 'gradle-wrapper.properties',
    folder: 'android/gradle/wrapper',
    category: 'config',
    description: 'Gradle wrapper distribution URL pinned to Gradle 8.6 for React Native 0.74',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
  },
  {
    path: 'android/app/build.gradle',
    filename: 'build.gradle',
    folder: 'android/app',
    category: 'config',
    description: 'App-level Android Gradle build script configuring applicationId, signingConfigs, Hermes, and native module linking',
    content: `apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

react {
    /* Autolinked React Native 0.74 configuration */
}

def enableProguardInReleaseBuilds = false
def jscFlavor = 'org.webkit:android-jsc:+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.imageresizerpro"
    defaultConfig {
        applicationId "com.imageresizerpro"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Uses debug keystore by default for GitHub Actions APK distribution; swap for upload keystore for Play Store
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}

apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)`,
  },
  {
    path: 'android/app/proguard-rules.pro',
    filename: 'proguard-rules.pro',
    folder: 'android/app',
    category: 'config',
    description: 'ProGuard / R8 obfuscation rules for React Native Android release builds',
    content: `# Add project specific ProGuard rules here.
# React Native & Hermes rules are automatically included by the React Native Gradle Plugin.`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    folder: 'android/app/src/main',
    category: 'config',
    description: 'Android manifest declaring Camera, Media/Gallery permissions, FileProvider/WhatsApp <queries> intents, and MainActivity',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />

    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        <intent>
            <action android:name="android.intent.action.SEND" />
            <data android:mimeType="image/*" />
        </intent>
    </queries>

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>`,
  },
  {
    path: 'android/app/src/debug/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    folder: 'android/app/src/debug',
    category: 'config',
    description: 'Debug Android manifest allowing cleartext Metro bundler traffic during local development',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:usesCleartextTraffic="true"
        tools:targetApi="28"
        tools:ignore="GoogleAppIndexingWarning" />
</manifest>`,
  },
  {
    path: 'android/app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    folder: 'android/app/src/main/res/values',
    category: 'config',
    description: 'Android string resources setting app display name to Image Resizer Pro',
    content: `<resources>
    <string name="app_name">Image Resizer Pro</string>
</resources>`,
  },
  {
    path: 'android/app/src/main/res/values/styles.xml',
    filename: 'styles.xml',
    folder: 'android/app/src/main/res/values',
    category: 'config',
    description: 'Android AppTheme dark-mode compatible base theme styles',
    content: `<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:editTextBackground">@android:color/transparent</item>
        <item name="android:statusBarColor">#0B0F17</item>
    </style>
</resources>`,
  },
  {
    path: 'android/app/src/main/java/com/imageresizerpro/MainActivity.kt',
    filename: 'MainActivity.kt',
    folder: 'android/app/src/main/java/com/imageresizerpro',
    category: 'config',
    description: 'Kotlin MainActivity registering ImageResizerPro root React component',
    content: `package com.imageresizerpro

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "ImageResizerPro"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}`,
  },
  {
    path: 'android/app/src/main/java/com/imageresizerpro/MainApplication.kt',
    filename: 'MainApplication.kt',
    folder: 'android/app/src/main/java/com/imageresizerpro',
    category: 'config',
    description: 'Kotlin MainApplication initializing SoLoader and autolinked native React Native packages',
    content: `package com.imageresizerpro

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}`,
  },
  {
    path: 'app.json',
    filename: 'app.json',
    folder: 'root',
    category: 'config',
    description: 'Standard React Native CLI app registry name configuration',
    content: `{
  "name": "ImageResizerPro",
  "displayName": "Image Resizer Pro"
}`,
  },
  {
    path: 'index.js',
    filename: 'index.js',
    folder: 'root',
    category: 'config',
    description: 'Native React Native CLI root entry file registering App with AppRegistry',
    content: `import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);`,
  },
  {
    path: 'babel.config.js',
    filename: 'babel.config.js',
    folder: 'root',
    category: 'config',
    description: 'Babel configuration using @react-native/babel-preset',
    content: `module.exports = {
  presets: ['module:@react-native/babel-preset'],
};`,
  },
  {
    path: 'metro.config.js',
    filename: 'metro.config.js',
    folder: 'root',
    category: 'config',
    description: 'Metro bundler configuration for React Native CLI',
    content: `const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);`,
  },
  {
    path: 'tsconfig.json',
    filename: 'tsconfig.json',
    folder: 'root',
    category: 'config',
    description: 'TypeScript configuration extending @react-native/typescript-config',
    content: `{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}`,
  },
  {
    path: 'App.tsx',
    filename: 'App.tsx',
    folder: 'root',
    category: 'screen',
    description: 'Root state container managing navigation flow between Home, Resize, and Preview with useImageResizer and useFilePicker',
    content: `import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResizeScreen } from './src/screens/ResizeScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';
import { useFilePicker } from './src/hooks/useFilePicker';
import {
  useImageResizer,
  ResizeOptions,
  ResizedImageResult,
} from './src/hooks/useImageResizer';
import { SelectedImage } from './src/types';

export type NavigationScreen = 'home' | 'resize' | 'preview';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('home');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // 1. Integrate useFilePicker hook for gallery & camera capture
  const {
    pickFromGallery,
    captureWithCamera,
    isLoading: isPickingFile,
    error: pickerError,
  } = useFilePicker();

  // 2. Integrate useImageResizer hook for resizing, quality compression & memory cleanup
  const {
    resizeImage,
    saveToGallery,
    cleanupTempFiles,
    resetState: resetResizer,
    isResizing,
    isSaving,
    error: resizerError,
    result: resizedResult,
    savedAsset,
    tempFilesCount,
  } = useImageResizer();

  // Handle image selection via photo library
  const handleSelectFromGallery = async () => {
    const image = await pickFromGallery();
    if (image) {
      setSelectedImage(image);
      setCurrentScreen('resize');
    }
  };

  // Handle image selection via device camera
  const handleCaptureFromCamera = async () => {
    const image = await captureWithCamera();
    if (image) {
      setSelectedImage(image);
      setCurrentScreen('resize');
    }
  };

  // Handle direct image selection (from samples or recent images)
  const handleSelectImageDirectly = (image: SelectedImage) => {
    setSelectedImage(image);
    setCurrentScreen('resize');
  };

  // Handle executing the image resizing and compression
  const handleExecuteResize = async (options: ResizeOptions) => {
    if (!selectedImage) return;
    const result = await resizeImage(selectedImage.uri, options);
    if (result) {
      setCurrentScreen('preview');
    }
  };

  // Handle saving the processed image directly to the device photo library
  const handleSaveToGallery = async (albumName?: string) => {
    if (!resizedResult?.uri) return;
    const asset = await saveToGallery(resizedResult.uri, albumName || 'Resized Photos');
    if (asset) {
      Alert.alert(
        'Saved to Photos! 🎉',
        'Your resized image has been successfully saved to your device gallery.'
      );
    }
  };

  // Navigation handlers with memory cleanup
  const handleBackToHome = async () => {
    if (resizedResult?.uri) {
      // Free temporary cache files from memory
      await cleanupTempFiles(resizedResult.uri);
    }
    resetResizer();
    setSelectedImage(null);
    setCurrentScreen('home');
  };

  const handleBackToResize = () => {
    setCurrentScreen('resize');
  };

  const handleStartOver = async () => {
    await cleanupTempFiles();
    resetResizer();
    setSelectedImage(null);
    setCurrentScreen('home');
  };

  const globalError = pickerError || resizerError;
  const isGlobalLoading = isPickingFile || isResizing || isSaving;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />

        {/* Global Navigation Header / Flow Stepper */}
        <View style={styles.navHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>Image Resizer Pro</Text>
            {tempFilesCount > 0 && (
              <View style={styles.memoryBadge}>
                <Text style={styles.memoryText}>Cache: {tempFilesCount}</Text>
              </View>
            )}
          </View>

          {/* Stepper Tabs */}
          <View style={styles.stepContainer}>
            <TouchableOpacity
              style={[styles.stepTab, currentScreen === 'home' && styles.stepTabActive]}
              onPress={handleBackToHome}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'home' && styles.stepTextActive]}>
                1. Select
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stepTab,
                currentScreen === 'resize' && styles.stepTabActive,
                !selectedImage && styles.stepTabDisabled,
              ]}
              disabled={!selectedImage}
              onPress={() => setCurrentScreen('resize')}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'resize' && styles.stepTextActive]}>
                2. Resize
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stepTab,
                currentScreen === 'preview' && styles.stepTabActive,
                !resizedResult && styles.stepTabDisabled,
              ]}
              disabled={!resizedResult}
              onPress={() => setCurrentScreen('preview')}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'preview' && styles.stepTextActive]}>
                3. Preview
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Error Banner */}
        {globalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        ) : null}

        {/* Active Screen View */}
        <View style={styles.screenContent}>
          {currentScreen === 'home' && (
            <HomeScreen
              onPickGallery={handleSelectFromGallery}
              onCaptureCamera={handleCaptureFromCamera}
              onSelectImage={handleSelectImageDirectly}
              isLoading={isPickingFile}
            />
          )}

          {currentScreen === 'resize' && selectedImage && (
            <ResizeScreen
              image={selectedImage}
              onBack={handleBackToHome}
              onResize={handleExecuteResize}
              isProcessing={isResizing}
            />
          )}

          {currentScreen === 'preview' && resizedResult && selectedImage && (
            <PreviewScreen
              originalImage={selectedImage}
              result={resizedResult}
              onBack={handleBackToResize}
              onSave={handleSaveToGallery}
              onReset={handleStartOver}
              isSaving={isSaving}
              savedAsset={savedAsset}
            />
          )}
        </View>

        {/* Global Activity Loading Indicator */}
        {isGlobalLoading ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.loadingMessage}>
                {isPickingFile && 'Opening photo selector...'}
                {isResizing && 'Manipulating & compressing image...'}
                {isSaving && 'Writing to device photo library...'}
              </Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  navHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  memoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  memoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  stepContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 7,
  },
  stepTabActive: {
    backgroundColor: '#0284C7',
  },
  stepTabDisabled: {
    opacity: 0.35,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  screenContent: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
    minWidth: 220,
  },
  loadingMessage: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});`,
  },
  {
    path: 'src/types/index.ts',
    filename: 'index.ts',
    folder: 'src/types',
    category: 'type',
    description: 'Shared TypeScript interfaces for image attributes, resizing options, and presets',
    content: `export type OutputFormat = 'jpeg' | 'png' | 'webp';

export type FitMode = 'contain' | 'cover' | 'fill';

export interface SelectedImage {
  uri: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

export interface ResizeConfig {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number; // 0.1 to 1.0 (or 10 to 100)
  format: OutputFormat;
  fitMode: FitMode;
  scalePercent: number;
}

export interface ProcessedResult {
  originalImage: SelectedImage;
  resizedUri: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: OutputFormat;
  processingTimeMs: number;
}

export interface DimensionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'social' | 'standard' | 'avatar';
  ratioLabel: string;
}`,
  },
  {
    path: 'src/components/FilePicker.tsx',
    filename: 'FilePicker.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Native photo gallery picker and camera selector with permission management',
    content: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, Camera, FolderOpen, Sparkles } from 'lucide-react-native';
import { useFilePicker } from '../hooks/useFilePicker';
import { SelectedImage } from '../types';

interface FilePickerProps {
  onImageSelected: (image: SelectedImage) => void;
  onPickGallery?: () => void;
  onCaptureCamera?: () => void;
  isLoading?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onImageSelected,
  onPickGallery,
  onCaptureCamera,
  isLoading: externalLoading,
}) => {
  const { pickFromGallery, captureWithCamera, isLoading: internalLoading, error } = useFilePicker();
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handlePick = async () => {
    if (onPickGallery) {
      onPickGallery();
      return;
    }
    const result = await pickFromGallery();
    if (result) onImageSelected(result);
  };

  const handleCapture = async () => {
    if (onCaptureCamera) {
      onCaptureCamera();
      return;
    }
    const result = await captureWithCamera();
    if (result) onImageSelected(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropZone}>
        <View style={styles.iconCircle}>
          <Image size={36} color="#38BDF8" />
        </View>
        <Text style={styles.title}>Select an Image to Resize</Text>
        <Text style={styles.subtitle}>
          Choose high-resolution photos, screenshots, or camera snaps
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Reading image metadata...</Text>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePick} activeOpacity={0.8}>
              <FolderOpen size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Photo Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleCapture} activeOpacity={0.8}>
              <Camera size={18} color="#E2E8F0" />
              <Text style={styles.secondaryButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  dropZone: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    marginTop: 12,
  },
});`,
  },
  {
    path: 'src/components/DimensionInput.tsx',
    filename: 'DimensionInput.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Precision dimension input with aspect ratio lock, presets, and scale percentages',
    content: `import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, Unlock, ArrowLeftRight, Check } from 'lucide-react-native';
import { DimensionPreset } from '../types';

interface DimensionInputProps {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onToggleLock: () => void;
  onSwapDimensions: () => void;
  onSelectPreset: (preset: DimensionPreset) => void;
  selectedPresetId?: string;
  originalDimensions: { width: number; height: number };
}

const PRESETS: DimensionPreset[] = [
  { id: 'ig-sq', name: 'Square', width: 1080, height: 1080, category: 'social', ratioLabel: '1:1' },
  { id: 'ig-st', name: 'Story/Reels', width: 1080, height: 1920, category: 'social', ratioLabel: '9:16' },
  { id: 'fhd', name: '1080p FHD', width: 1920, height: 1080, category: 'standard', ratioLabel: '16:9' },
  { id: 'hd', name: '720p HD', width: 1280, height: 720, category: 'standard', ratioLabel: '16:9' },
  { id: 'avatar', name: 'Avatar', width: 400, height: 400, category: 'avatar', ratioLabel: '1:1' },
];

export const DimensionInput: React.FC<DimensionInputProps> = ({
  width,
  height,
  maintainAspectRatio,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onSwapDimensions,
  onSelectPreset,
  selectedPresetId,
  originalDimensions,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Dimensions (Pixels)</Text>
        <Text style={styles.originalInfo}>
          Original: {originalDimensions.width} × {originalDimensions.height}
        </Text>
      </View>

      {/* Numerical Inputs with Lock */}
      <View style={styles.inputContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Width (px)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(width || '')}
            onChangeText={(txt) => {
              const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
              onWidthChange(isNaN(num) ? 0 : num);
            }}
            placeholder="Width"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.controlsMiddle}>
          <TouchableOpacity
            style={[styles.lockButton, maintainAspectRatio && styles.lockButtonActive]}
            onPress={onToggleLock}
            activeOpacity={0.7}
          >
            {maintainAspectRatio ? (
              <Lock size={16} color="#38BDF8" />
            ) : (
              <Unlock size={16} color="#64748B" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={onSwapDimensions}
            activeOpacity={0.7}
          >
            <ArrowLeftRight size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Height (px)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(height || '')}
            onChangeText={(txt) => {
              const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
              onHeightChange(isNaN(num) ? 0 : num);
            }}
            placeholder="Height"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Preset Pills */}
      <Text style={styles.presetHeading}>Quick Social & Standard Presets</Text>
      <View style={styles.presetScroll}>
        {PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
              onPress={() => onSelectPreset(preset)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                {preset.name}
              </Text>
              <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubActive]}>
                {preset.width}×{preset.height}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  originalInfo: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsMiddle: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
  },
  lockButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockButtonActive: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  swapButton: {
    padding: 6,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  presetChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  presetChipTextActive: {
    color: '#38BDF8',
  },
  presetChipSub: {
    fontSize: 10,
    color: '#64748B',
  },
  presetChipSubActive: {
    color: '#7DD3FC',
  },
});`,
  },
  {
    path: 'src/components/QualitySlider.tsx',
    filename: 'QualitySlider.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Compression quality slider with haptics, level badges, and file reduction estimates',
    content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface QualitySliderProps {
  quality: number; // 10 to 100
  onQualityChange: (value: number) => void;
  format: string;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  quality,
  onQualityChange,
  format,
}) => {
  const getQualityBadge = () => {
    if (quality >= 90) return { label: 'Maximum / Crisp', color: '#10B981', note: 'Largest file size' };
    if (quality >= 75) return { label: 'High Quality', color: '#38BDF8', note: 'Recommended balance' };
    if (quality >= 50) return { label: 'Medium', color: '#F59E0B', note: 'Good for web / chat' };
    return { label: 'Low / Compact', color: '#EF4444', note: 'Aggressive compression' };
  };

  const badge = getQualityBadge();
  const isLosslessFormat = format.toUpperCase() === 'PNG';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Compression Quality</Text>
        <View style={[styles.badge, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>
            {isLosslessFormat ? 'Lossless (PNG)' : \`\${quality}% - \${badge.label}\`}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {isLosslessFormat
          ? 'PNG uses lossless compression. Dimension scaling controls the final file size.'
          : \`Controls JPEG/WebP quantization. \${badge.note}.\`}
      </Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          step={5}
          value={quality}
          onValueChange={onQualityChange}
          minimumTrackTintColor="#38BDF8"
          maximumTrackTintColor="#334155"
          thumbTintColor="#38BDF8"
          disabled={isLosslessFormat}
        />
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleText}>10% (Smallest)</Text>
          <Text style={styles.scaleText}>50%</Text>
          <Text style={styles.scaleText}>80% (Sweet spot)</Text>
          <Text style={styles.scaleText}>100%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scaleText: {
    fontSize: 11,
    color: '#64748B',
  },
});`,
  },
  {
    path: 'src/components/FormatSelector.tsx',
    filename: 'FormatSelector.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Output format selector for JPEG, PNG, and WEBP with transparency & size badges',
    content: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OutputFormat } from '../types';

interface FormatSelectorProps {
  selectedFormat: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
}

const FORMAT_OPTIONS: { id: OutputFormat; label: string; badge: string; desc: string }[] = [
  { id: 'jpeg', label: 'JPEG', badge: 'Universal', desc: 'Standard photo format with highest compatibility' },
  { id: 'png', label: 'PNG', badge: 'Lossless', desc: 'Preserves sharp graphics & alpha transparency' },
  { id: 'webp', label: 'WEBP', badge: 'Best Size', desc: 'Modern high-efficiency compression for mobile' },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Output Format</Text>
      <View style={styles.formatRow}>
        {FORMAT_OPTIONS.map((item) => {
          const isSelected = selectedFormat === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.formatButton, isSelected && styles.formatButtonActive]}
              onPress={() => onFormatChange(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.badgeRow}>
                <Text style={[styles.formatLabel, isSelected && styles.formatLabelActive]}>
                  {item.label}
                </Text>
                <View style={[styles.pill, isSelected && styles.pillActive]}>
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {item.badge}
                  </Text>
                </View>
              </View>
              <Text style={styles.formatDesc} numberOfLines={2}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  formatRow: {
    gap: 8,
  },
  formatButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  formatButtonActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  formatLabelActive: {
    color: '#38BDF8',
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: '#0284C7',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  formatDesc: {
    fontSize: 11,
    color: '#64748B',
  },
});`,
  },
  {
    path: 'src/components/ImagePreview.tsx',
    filename: 'ImagePreview.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Split-view comparison component showing before and after image rendering with touch slider',
    content: `import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, PanResponder } from 'react-native';

interface ImagePreviewProps {
  originalUri: string;
  resizedUri: string;
  originalWidth: number;
  originalHeight: number;
  resizedWidth: number;
  resizedHeight: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUri,
  resizedUri,
  originalWidth,
  originalHeight,
  resizedWidth,
  resizedHeight,
}) => {
  const [splitRatio, setSplitRatio] = useState(0.5); // 0.0 to 1.0

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const containerWidth = SCREEN_WIDTH;
      const newRatio = Math.max(0.05, Math.min(0.95, gestureState.moveX / containerWidth));
      setSplitRatio(newRatio);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageStage} {...panResponder.panHandlers}>
        {/* Resized Image (Full Base) */}
        <Image
          source={{ uri: resizedUri }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Original Image (Clipped Left Layer) */}
        <View style={[styles.clippedContainer, { width: \`\${splitRatio * 100}%\` }]}>
          <Image
            source={{ uri: originalUri }}
            style={[styles.image, { width: SCREEN_WIDTH }]}
            resizeMode="contain"
          />
        </View>

        {/* Divider Bar */}
        <View style={[styles.divider, { left: \`\${splitRatio * 100}%\` }]}>
          <View style={styles.handleCircle}>
            <Text style={styles.handleText}>↔</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.originalBadge}>
          <Text style={styles.badgeLabel}>Original</Text>
        </View>
        <View style={styles.resizedBadge}>
          <Text style={styles.badgeLabel}>Resized</Text>
        </View>
      </View>
      <Text style={styles.hint}>Drag divider sideways to compare pixel details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
  },
  imageStage: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  clippedContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#38BDF8',
    marginLeft: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 14,
  },
  originalBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resizedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
});`,
  },
  {
    path: 'src/screens/HomeScreen.tsx',
    filename: 'HomeScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Welcome and image selection screen with gallery shortcuts and recent templates',
    content: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FilePicker } from '../components/FilePicker';
import { SelectedImage } from '../types';

interface HomeScreenProps {
  onSelectImage?: (image: SelectedImage) => void;
  onPickGallery?: () => void;
  onCaptureCamera?: () => void;
  isLoading?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectImage,
  onPickGallery,
  onCaptureCamera,
  isLoading,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>Image Resizer Pro</Text>
        <Text style={styles.tagline}>
          Fast, on-device mobile image compression and dimension scaling
        </Text>
      </View>

      <FilePicker
        onImageSelected={(img) => onSelectImage?.(img)}
        onPickGallery={onPickGallery}
        onCaptureCamera={onCaptureCamera}
        isLoading={isLoading}
      />

      <View style={styles.featuresCard}>
        <Text style={styles.featureTitle}>Key Capabilities</Text>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>⚡</Text>
          <Text style={styles.featureText}>100% On-device native processing with zero server uploads</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>📐</Text>
          <Text style={styles.featureText}>Custom dimension scaling & lock aspect-ratio preserving</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>🎯</Text>
          <Text style={styles.featureText}>Granular JPEG/WEBP quality slider with live size savings</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureBullet: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
});`,
  },
  {
    path: 'src/screens/ResizeScreen.tsx',
    filename: 'ResizeScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Main configuration screen orchestrating dimensions, quality sliders, and format selectors',
    content: `import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Play } from 'lucide-react-native';
import { DimensionInput } from '../components/DimensionInput';
import { QualitySlider } from '../components/QualitySlider';
import { FormatSelector } from '../components/FormatSelector';
import { useImageResizer } from '../hooks/useImageResizer';
import { SelectedImage, ResizeConfig, ProcessedResult, DimensionPreset, OutputFormat } from '../types';

interface ResizeScreenProps {
  image: SelectedImage;
  onBack: () => void;
  onResize?: (options: any) => void;
  onComplete?: (result: ProcessedResult) => void;
  isProcessing?: boolean;
}

export const ResizeScreen: React.FC<ResizeScreenProps> = ({
  image,
  onBack,
  onResize,
  onComplete,
  isProcessing: isProcessingProp,
}) => {
  const { resizeImage, isProcessing: isHookProcessing } = useImageResizer();
  const isBusy = isProcessingProp !== undefined ? isProcessingProp : isHookProcessing;

  const [width, setWidth] = useState(image.width);
  const [height, setHeight] = useState(image.height);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  const aspectRatio = image.width / image.height;

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setSelectedPresetId(undefined);
    if (maintainRatio && newWidth > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setSelectedPresetId(undefined);
    if (maintainRatio && newHeight > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleToggleLock = () => {
    setMaintainRatio(!maintainRatio);
  };

  const handleSwap = () => {
    const temp = width;
    setWidth(height);
    setHeight(temp);
  };

  const handlePreset = (preset: DimensionPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setSelectedPresetId(preset.id);
  };

  const handleProcess = async () => {
    if (onResize) {
      onResize({
        width,
        height,
        maintainAspectRatio: maintainRatio,
        quality,
        format,
      });
      return;
    }

    const config: ResizeConfig = {
      width,
      height,
      maintainAspectRatio: maintainRatio,
      quality,
      format,
      fitMode: 'contain',
      scalePercent: Math.round((width / image.width) * 100),
    };

    const result = await resizeImage(image.uri, config);
    if (result) onComplete?.(result as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>Resize Configuration</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <DimensionInput
          width={width}
          height={height}
          maintainAspectRatio={maintainRatio}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onToggleLock={handleToggleLock}
          onSwapDimensions={handleSwap}
          onSelectPreset={handlePreset}
          selectedPresetId={selectedPresetId}
          originalDimensions={{ width: image.width, height: image.height }}
        />

        <QualitySlider
          quality={quality}
          onQualityChange={setQuality}
          format={format}
        />

        <FormatSelector
          selectedFormat={format}
          onFormatChange={setFormat}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.processButton}
          onPress={handleProcess}
          disabled={isBusy}
          activeOpacity={0.8}
        >
          {isBusy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.processButtonText}>Process & Preview</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  processButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});`,
  },
  {
    path: 'src/screens/PreviewScreen.tsx',
    filename: 'PreviewScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Preview screen with before/after comparison, file size statistics, gallery export via CameraRoll, and direct WhatsApp sharing via react-native-share and Linking',
    content: `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share, { Social } from 'react-native-share';
import { ImagePreview } from '../components/ImagePreview';
import { ProcessedResult, SelectedImage } from '../types';
import { formatBytes, calculateSavings } from '../utils/formatters';

interface PreviewScreenProps {
  originalImage?: SelectedImage;
  result: ProcessedResult;
  onBack: () => void;
  onReset: () => void;
  onSave?: (albumName?: string) => void;
  isSaving?: boolean;
  savedAsset?: any;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  originalImage: originalImageProp,
  result,
  onBack,
  onReset,
  onSave,
  isSaving: isSavingProp = false,
  savedAsset,
}) => {
  const [internalSaving, setInternalSaving] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isSharingOther, setIsSharingOther] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const orig = originalImageProp || (result as any).originalImage;
  const originalBytes = orig?.sizeBytes || 0;
  const resizedBytes = result.sizeBytes || 0;
  const savings = calculateSavings(originalBytes, resizedBytes);

  const targetUri = result.resizedUri || (result as any).uri;
  const format = (result.format || 'jpeg').toLowerCase();
  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';

  const ensureFileUri = (uri: string) => {
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      return uri;
    }
    return \`file://\${uri}\`;
  };

  /**
   * Prominent Share on WhatsApp feature:
   * Uses react-native-share (Share.shareSingle -> Social.WHATSAPP) to deliver the binary image directly into WhatsApp
   * with standard Share.open and Linking (whatsapp://send) fallbacks.
   */
  const handleShareWhatsApp = async () => {
    if (!targetUri) {
      Alert.alert('Sharing Error', 'No resized image URI available to share.');
      return;
    }

    setIsSharingWhatsApp(true);
    const caption = \`Resized photo: \${result.width}x\${result.height}px (\${formatBytes(result.sizeBytes)}) via Image Resizer Pro\`;
    const fileUrl = ensureFileUri(targetUri);

    try {
      await Share.shareSingle({
        title: 'Share Resized Image on WhatsApp',
        message: caption,
        url: fileUrl,
        type: mimeType,
        social: Social.WHATSAPP,
        filename: \`resized_\${result.width}x\${result.height}\`,
      });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('User did not share') || msg.includes('cancelled')) {
        return;
      }

      // Fallback to native whatsapp:// deep link or general share sheet
      try {
        const canOpen = await Linking.canOpenURL('whatsapp://send');
        if (canOpen) {
          await Linking.openURL(\`whatsapp://send?text=\${encodeURIComponent(caption)}\`);
        } else {
          await handleShareGeneral();
        }
      } catch {
        Alert.alert(
          'WhatsApp Not Available',
          'WhatsApp could not be opened directly. Would you like to share via another app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share to Other Apps', onPress: handleShareGeneral },
          ]
        );
      }
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  /**
   * Standard Native Share for other social apps, AirDrop, Email, etc.
   */
  const handleShareGeneral = async () => {
    if (!targetUri) return;
    setIsSharingOther(true);
    try {
      await Share.open({
        title: 'Share Resized Image',
        message: \`Resized image (\${result.width}x\${result.height}px, \${formatBytes(result.sizeBytes)})\`,
        url: ensureFileUri(targetUri),
        type: mimeType,
        failOnCancel: false,
      });
    } catch (err: any) {
      if (err?.message && !err.message.includes('User did not share')) {
        Alert.alert('Share Failed', err.message || 'Could not share image.');
      }
    } finally {
      setIsSharingOther(false);
    }
  };

  /**
   * Request Android storage/media permissions before saving to Gallery
   */
  const requestAndroidSavePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);

    if (apiLevel >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  /**
   * Save directly to the device photo library using @react-native-camera-roll/camera-roll
   */
  const handleSaveToGallery = async () => {
    if (onSave) {
      onSave('Resized Photos');
      return;
    }

    if (!targetUri) {
      Alert.alert('Save Error', 'No image file found to save.');
      return;
    }

    setInternalSaving(true);
    try {
      const hasPermission = await requestAndroidSavePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Needed',
          'Please allow photo library access in Settings to save your resized images.'
        );
        return;
      }

      await CameraRoll.saveAsset(ensureFileUri(targetUri), {
        type: 'photo',
        album: 'Resized Photos',
      });

      setSavedSuccessMessage('Saved to your Photos gallery!');
      Alert.alert('Success!', 'Resized photo saved to your gallery.');
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save photo.');
    } finally {
      setInternalSaving(false);
    }
  };

  const isSaving = isSavingProp || internalSaving;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>Comparison & Preview</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Before/After Split Comparison */}
        <ImagePreview
          originalUri={orig?.uri || ''}
          resizedUri={targetUri}
          originalWidth={orig?.width || result.width}
          originalHeight={orig?.height || result.height}
          resizedWidth={result.width}
          resizedHeight={result.height}
        />

        {/* Compression & Dimension Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Compression & Dimension Results</Text>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Attribute</Text>
            <Text style={styles.tableHead}>Original</Text>
            <Text style={styles.tableHeadActive}>Resized</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Dimensions</Text>
            <Text style={styles.tableValue}>
              {orig?.width || '-'} × {orig?.height || '-'}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {result.width} × {result.height}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>File Size</Text>
            <Text style={styles.tableValue}>
              {formatBytes(originalBytes)}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {formatBytes(resizedBytes)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Format</Text>
            <Text style={styles.tableValue}>
              {orig?.mimeType ? orig.mimeType.replace('image/', '').toUpperCase() : 'JPEG'}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {format.toUpperCase()}
            </Text>
          </View>

          {/* Savings Badge */}
          <View
            style={[
              styles.savingsBanner,
              !savings.isReduction && styles.savingsBannerExpansion,
            ]}
          >
            <Sparkles size={16} color={savings.isReduction ? '#10B981' : '#F59E0B'} />
            <Text
              style={[
                styles.savingsText,
                !savings.isReduction && styles.savingsTextExpansion,
              ]}
            >
              {savings.isReduction
                ? \`🎉 Saved \${savings.percentage}% (\${formatBytes(savings.differenceBytes)} reduced)\`
                : \`Expanded dimensions by \${savings.percentage}%\`}
            </Text>
          </View>
        </View>

        {/* Success Banner if saved */}
        {(savedSuccessMessage || savedAsset) && (
          <View style={styles.successToast}>
            <CheckCircle2 size={18} color="#10B981" />
            <Text style={styles.successToastText}>
              {savedSuccessMessage || 'Successfully saved in "Resized Photos" album'}
            </Text>
          </View>
        )}

        {/* Prominent WhatsApp Share Button */}
        <TouchableOpacity
          style={styles.whatsAppButton}
          onPress={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          activeOpacity={0.85}
        >
          {isSharingWhatsApp ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.whatsAppIconBadge}>
              <Text style={styles.whatsAppIconText}>WA</Text>
            </View>
          )}
          <View style={styles.whatsAppTextContainer}>
            <Text style={styles.whatsAppButtonText}>Share on WhatsApp</Text>
            <Text style={styles.whatsAppButtonSubtext}>Instant send with full resolution</Text>
          </View>
        </TouchableOpacity>

        {/* Secondary Action Row: Save to Photos & Other Apps */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveToGallery}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Download size={18} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save to Photos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareGeneral}
            disabled={isSharingOther}
            activeOpacity={0.8}
          >
            {isSharingOther ? (
              <ActivityIndicator size="small" color="#F1F5F9" />
            ) : (
              <Share2 size={18} color="#F1F5F9" />
            )}
            <Text style={styles.shareButtonText}>Other Apps</Text>
          </TouchableOpacity>
        </View>

        {/* Resize Another Image Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.7}>
          <RefreshCw size={14} color="#94A3B8" />
          <Text style={styles.resetButtonText}>Resize Another Image</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tableLabel: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  tableHead: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  tableHeadActive: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 6,
  },
  tableValue: {
    fontSize: 13,
    color: '#CBD5E1',
    width: 100,
    textAlign: 'right',
  },
  tableValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    width: 100,
    textAlign: 'right',
  },
  savingsBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savingsBannerExpansion: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  savingsText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  savingsTextExpansion: {
    color: '#F59E0B',
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  successToastText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
  },
  whatsAppButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  whatsAppIconBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsAppIconText: {
    color: '#25D366',
    fontSize: 11,
    fontWeight: '900',
  },
  whatsAppTextContainer: {
    alignItems: 'flex-start',
  },
  whatsAppButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  whatsAppButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
  },
  resetButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});`,
  },
  {
    path: 'src/hooks/useImageResizer.ts',
    filename: 'useImageResizer.ts',
    folder: 'src/hooks',
    category: 'hook',
    description: 'Custom React hook wrapping @bam.tech/react-native-image-resizer, CameraRoll, and RNFS with gallery export and memory cleanup',
    content: `import { useState, useCallback, useRef, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { CameraRoll, PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface ResizeOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Compression quality slider: 0.1 to 1.0 or 10 to 100 (%) */
  quality?: number;
  /** Output image format (default: 'jpeg') */
  format?: OutputFormat;
  /** When true, preserves aspect ratio if only width or height is provided */
  maintainAspectRatio?: boolean;
  /** Whether to return base64 string (default: false to preserve memory) */
  base64?: boolean;
  /** Optional custom album name in the photo library */
  albumName?: string;
  /** Whether to automatically save to gallery once resized (default: false) */
  autoSaveToGallery?: boolean;
  /** Whether to automatically delete previous temp file on new resize (default: true) */
  autoCleanupPrevious?: boolean;
}

export interface ResizedImageResult {
  /** Local file URI in application cache */
  uri: string;
  /** Result width */
  width: number;
  /** Result height */
  height: number;
  /** Exact file size in bytes */
  sizeBytes: number;
  /** Selected format */
  format: OutputFormat;
  /** Base64 string if requested */
  base64?: string;
  /** Gallery asset info if saved */
  asset?: PhotoIdentifier | null;
  /** Execution time in milliseconds */
  processingTimeMs: number;
}

export interface UseImageResizerReturn {
  resizeImage: (
    sourceUri: string,
    options?: ResizeOptions
  ) => Promise<ResizedImageResult | null>;
  saveToGallery: (
    targetUri?: string,
    albumName?: string
  ) => Promise<PhotoIdentifier | null>;
  cleanupTempFiles: (specificUri?: string) => Promise<void>;
  requestGalleryPermission: () => Promise<boolean>;
  resetState: () => void;
  isResizing: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  result: ResizedImageResult | null;
  savedAsset: PhotoIdentifier | null;
  permissionStatus: 'granted' | 'denied' | null;
  tempFilesCount: number;
}

export function normalizeQuality(quality?: number): number {
  if (quality === undefined || isNaN(quality)) return 0.8;
  if (quality > 1) {
    return Math.max(0.1, Math.min(1.0, quality / 100));
  }
  return Math.max(0.1, Math.min(1.0, quality));
}

function stripFileScheme(uri: string): string {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

export const useImageResizer = (): UseImageResizerReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResizedImageResult | null>(null);
  const [savedAsset, setSavedAsset] = useState<PhotoIdentifier | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | null>(null);
  const [tempFilesCount, setTempFilesCount] = useState(0);

  // Track all generated temporary URIs for memory management & cleanup
  const tempUrisRef = useRef<Set<string>>(new Set());

  const cleanupTempFiles = useCallback(async (specificUri?: string) => {
    try {
      if (specificUri) {
        const fsPath = stripFileScheme(specificUri);
        const exists = await RNFS.exists(fsPath);
        if (exists) {
          await RNFS.unlink(fsPath);
        }
        tempUrisRef.current.delete(specificUri);
      } else {
        const urisToDelete = Array.from(tempUrisRef.current);
        await Promise.all(
          urisToDelete.map(async (uri) => {
            try {
              const fsPath = stripFileScheme(uri);
              const exists = await RNFS.exists(fsPath);
              if (exists) {
                await RNFS.unlink(fsPath);
              }
            } catch {
              // Ignore single file deletion failures
            }
          })
        );
        tempUrisRef.current.clear();
      }
      setTempFilesCount(tempUrisRef.current.size);
    } catch (cleanupErr: any) {
      console.warn('Memory cleanup error:', cleanupErr.message);
    }
  }, []);

  useEffect(() => {
    return () => {
      const uris = Array.from(tempUrisRef.current);
      uris.forEach((uri) => {
        RNFS.unlink(stripFileScheme(uri)).catch(() => {});
      });
      tempUrisRef.current.clear();
    };
  }, []);

  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        setPermissionStatus('granted');
        return true;
      }

      const apiLevel = typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10);

      const permission =
        apiLevel >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const status = await PermissionsAndroid.request(permission);
      const isGranted = status === PermissionsAndroid.RESULTS.GRANTED;
      setPermissionStatus(isGranted ? 'granted' : 'denied');
      return isGranted;
    } catch (err: any) {
      setError(err.message || 'Permission request failed');
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const saveToGallery = useCallback(
    async (
      targetUri?: string,
      albumName?: string
    ): Promise<PhotoIdentifier | null> => {
      const uriToSave = targetUri || result?.uri;
      if (!uriToSave) {
        setError('No image available to save');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
          throw new Error('Photo gallery permission denied. Please enable photos access in device settings.');
        }

        const formattedUri = uriToSave.startsWith('file://') || uriToSave.startsWith('content://')
          ? uriToSave
          : \`file://\${uriToSave}\`;

        const asset = await CameraRoll.saveAsset(formattedUri, {
          type: 'photo',
          album: albumName?.trim() || undefined,
        });

        setSavedAsset(asset);
        return asset;
      } catch (saveErr: any) {
        const msg = saveErr.message || 'Failed to save photo to gallery';
        setError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [result, requestGalleryPermission]
  );

  const resizeImage = useCallback(
    async (
      sourceUri: string,
      options: ResizeOptions = {}
    ): Promise<ResizedImageResult | null> => {
      if (!sourceUri) {
        setError('Source image URI is required');
        return null;
      }

      setIsResizing(true);
      setError(null);
      const startTime = Date.now();

      try {
        const {
          width = 1080,
          height = 1080,
          quality = 80,
          format = 'jpeg',
          maintainAspectRatio = true,
          base64 = false,
          albumName,
          autoSaveToGallery = false,
          autoCleanupPrevious = true,
        } = options;

        if (autoCleanupPrevious && result?.uri) {
          await cleanupTempFiles(result.uri);
        }

        const formatMap: Record<OutputFormat, 'JPEG' | 'PNG' | 'WEBP'> = {
          jpeg: 'JPEG',
          png: 'PNG',
          webp: 'WEBP',
        };
        const compressFormat = formatMap[format] || 'JPEG';
        const qualityPercent = format === 'png'
          ? 100
          : Math.round(normalizeQuality(quality) * 100);

        const resized = await ImageResizer.createResizedImage(
          sourceUri,
          width || 4096,
          height || 4096,
          compressFormat,
          qualityPercent,
          0,
          undefined,
          false,
          {
            mode: maintainAspectRatio ? 'contain' : 'stretch',
            onlyScaleDown: false,
          }
        );

        tempUrisRef.current.add(resized.uri);
        setTempFilesCount(tempUrisRef.current.size);

        let sizeBytes = resized.size || 0;
        if (!sizeBytes) {
          const stat = await RNFS.stat(stripFileScheme(resized.uri));
          sizeBytes = Number(stat.size) || 0;
        }

        let base64String: string | undefined;
        if (base64) {
          base64String = await RNFS.readFile(stripFileScheme(resized.uri), 'base64');
        }

        let asset: PhotoIdentifier | null = null;
        if (autoSaveToGallery) {
          asset = await saveToGallery(resized.uri, albumName);
        }

        const processed: ResizedImageResult = {
          uri: resized.uri,
          width: resized.width,
          height: resized.height,
          sizeBytes,
          format,
          base64: base64String,
          asset,
          processingTimeMs: Date.now() - startTime,
        };

        setResult(processed);
        return processed;
      } catch (resizeErr: any) {
        const msg = resizeErr.message || 'Image resizing failed';
        setError(msg);
        return null;
      } finally {
        setIsResizing(false);
      }
    },
    [result, cleanupTempFiles, saveToGallery]
  );

  const resetState = useCallback(() => {
    setError(null);
    setResult(null);
    setSavedAsset(null);
  }, []);

  return {
    resizeImage,
    saveToGallery,
    cleanupTempFiles,
    requestGalleryPermission,
    resetState,
    isResizing,
    isSaving,
    isLoading: isResizing || isSaving,
    isProcessing: isResizing,
    error,
    result,
    savedAsset,
    permissionStatus,
    tempFilesCount,
  };
};`,
  },
  {
    path: 'src/hooks/useFilePicker.ts',
    filename: 'useFilePicker.ts',
    folder: 'src/hooks',
    category: 'hook',
    description: 'Pure React Native hook using react-native-image-picker and RNFS with Android/iOS camera & gallery permissions',
    content: `import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { SelectedImage } from '../types';

export const useFilePicker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPickerResult = async (asset: Asset): Promise<SelectedImage | null> => {
    if (!asset.uri) return null;

    let sizeBytes = asset.fileSize || 0;
    if (!sizeBytes && asset.uri.startsWith('file://')) {
      try {
        const stat = await RNFS.stat(asset.uri.replace('file://', ''));
        sizeBytes = Number(stat.size) || 0;
      } catch {
        sizeBytes = 0;
      }
    }

    const name = asset.fileName || \`image_\${Date.now()}.jpg\`;

    return {
      uri: asset.uri,
      name,
      width: asset.width || 1080,
      height: asset.height || 1080,
      sizeBytes,
      mimeType: asset.type || 'image/jpeg',
    };
  };

  const requestAndroidCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickFromGallery = async (): Promise<SelectedImage | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return null;
      }
      if (result.errorCode) {
        setError(result.errorMessage || 'Error selecting photo');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        return await processPickerResult(result.assets[0]);
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error selecting photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const captureWithCamera = async (): Promise<SelectedImage | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const granted = await requestAndroidCameraPermission();
      if (!granted) {
        setError('Permission to access camera was denied');
        return null;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return null;
      }
      if (result.errorCode) {
        setError(result.errorMessage || 'Error capturing photo');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        return await processPickerResult(result.assets[0]);
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error capturing photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { pickFromGallery, captureWithCamera, isLoading, error };
};`,
  },
  {
    path: 'src/utils/formatters.ts',
    filename: 'formatters.ts',
    folder: 'src/utils',
    category: 'util',
    description: 'Formatting utilities for byte sizes and compression savings percentages',
    content: `export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0 || isNaN(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  return \`\${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} \${sizes[index]}\`;
}

export function calculateSavings(
  originalBytes: number,
  resizedBytes: number
): { differenceBytes: number; percentage: number; isReduction: boolean } {
  if (!originalBytes || !resizedBytes) {
    return { differenceBytes: 0, percentage: 0, isReduction: false };
  }

  const diff = originalBytes - resizedBytes;
  const percentage = Math.round((diff / originalBytes) * 1000) / 10;
  return {
    differenceBytes: Math.abs(diff),
    percentage: Math.abs(percentage),
    isReduction: diff >= 0,
  };
}`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    folder: 'root',
    category: 'doc',
    description: 'Complete documentation for building Android APKs directly on GitHub Actions with Pure React Native CLI (Zero Expo)',
    content: `# Image Resizer Pro (Pure React Native CLI + GitHub Actions APK Build)

A high-performance, on-device image resizing and compression mobile application built with **Pure React Native CLI (0.74.5)** and **TypeScript** — **No Expo / No EAS required**. Ready to build directly into an installable Android APK using **GitHub Actions**.

## 🚀 Features

- **File Selection Component**: Native gallery picker and camera capture via \`react-native-image-picker\`.
- **Precision Resizing Controls**:
  - Width and Height numerical inputs with aspect ratio lock and swap functionality.
  - Social & standard presets (Instagram Square, Story 9:16, 1080p FHD, 720p HD, Avatar).
  - Granular quality slider (10% to 100%) with real-time file size savings calculation.
  - Multi-format exporter (JPEG, PNG, WEBP) powered by \`@bam.tech/react-native-image-resizer\`.
- **Interactive Preview Screen**:
  - Side-by-side / split-screen comparison slider (\`ImagePreview\`) to inspect pixel detail before and after resizing.
  - Full attribute comparison table (resolution, byte size, format, savings).
  - Prominent **Share on WhatsApp** button via \`react-native-share\` (\`Social.WHATSAPP\`) and native \`Linking\` fallback.
  - Direct saving to device Photos library via \`@react-native-camera-roll/camera-roll\`.
  - Automatic temp file cache cleanup using \`react-native-fs\`.

## 🤖 Automated APK Build on GitHub (No Expo)

This project includes \`.github/workflows/android-apk.yml\` which automatically compiles your Android APK directly on GitHub:

1. Push this project to a GitHub repository on the \`main\` branch.
2. Open the **Actions** tab on GitHub — the **Build Android APK (GitHub Actions)** workflow starts automatically.
3. GitHub sets up Node 20, Java JDK 17, Android SDK, bootstraps the React Native 0.74.5 Gradle project, configures permissions via \`scripts/configure-android.js\`, and compiles \`app-debug.apk\`.
4. Download the compiled **\`ImageResizerPro-Android-APK\`** artifact or grab it directly from **GitHub Releases**!

## 🛠️ Local Development (React Native CLI)

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Generate native android/ios folders (first time only)
npx @react-native-community/cli@latest init TempRN --version 0.74.5 --skip-install --skip-git-init
cp -r TempRN/android ./android && cp -r TempRN/ios ./ios && rm -rf TempRN
node scripts/configure-android.js

# 3. Start Metro & run on Android device/emulator
npm start
npm run android
\`\`\`

## 📁 Architecture Overview

\`\`\`
image-resizer-rn/
├── .github/workflows/
│   └── android-apk.yml          # GitHub Actions Gradle APK Builder (Debug & Release)
├── android/
│   ├── build.gradle             # Root Gradle & Kotlin setup (SDK 34)
│   ├── settings.gradle          # Native module autolinking
│   ├── gradle.properties        # Hermes & architecture flags
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties
│   └── app/
│       ├── build.gradle         # Application ID, signingConfigs & dependencies
│       ├── proguard-rules.pro   # Release build rules
│       └── src/
│           ├── debug/AndroidManifest.xml
│           └── main/
│               ├── AndroidManifest.xml          # Camera, Media & WhatsApp permissions
│               ├── res/values/strings.xml       # App display name
│               ├── res/values/styles.xml        # Dark mode theme
│               └── java/com/imageresizerpro/
│                   ├── MainActivity.kt          # Root Android activity
│                   └── MainApplication.kt       # PackageList autolinking
├── scripts/
│   └── configure-android.js     # AndroidManifest permissions verifier
├── app.json                     # React Native CLI app name config
├── index.js                     # AppRegistry entry point
├── babel.config.js              # @react-native/babel-preset
├── metro.config.js              # Metro bundler config
├── package.json                 # Pure RN CLI dependencies (Zero Expo)
├── tsconfig.json                # TypeScript settings
├── App.tsx                      # Root navigation & state
└── src/
    ├── components/
    │   ├── FilePicker.tsx       # Image & camera selection
    │   ├── DimensionInput.tsx   # Pixel inputs & aspect lock
    │   ├── QualitySlider.tsx    # Compression slider
    │   ├── FormatSelector.tsx   # JPEG/PNG/WEBP switch
    │   └── ImagePreview.tsx     # Split-screen comparison
    ├── screens/
    │   ├── HomeScreen.tsx       # Landing & gallery screen
    │   ├── ResizeScreen.tsx     # Configuration workspace
    │   └── PreviewScreen.tsx    # Inspection & export screen
    ├── hooks/
    │   ├── useImageResizer.ts   # Native ImageResizer + CameraRoll + RNFS
    │   └── useFilePicker.ts     # react-native-image-picker + permissions
    ├── utils/
    │   └── formatters.ts        # Byte & percentage formatters
    └── types/
        └── index.ts             # Shared TypeScript types
\`\`\`
`,
  },
];
