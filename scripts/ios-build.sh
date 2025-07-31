#!/bin/bash

# iOS Build Script for ColorFullBestGames
# Usage: ./scripts/ios-build.sh [clean|pods|build|simulator]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/ios"

echo "🍎 iOS Build Script for ColorFullBestGames"
echo "Project root: $PROJECT_ROOT"

cd "$IOS_DIR"

case "$1" in
  "clean")
    echo "🧹 Cleaning iOS build..."
    rm -rf Pods/
    rm -rf build/
    rm -rf DerivedData/
    rm -f Podfile.lock
    echo "✅ Clean completed"
    ;;
  "pods")
    echo "📦 Installing CocoaPods..."
    if command -v pod >/dev/null 2>&1; then
      pod install --repo-update
    else
      echo "❌ CocoaPods not found. Please install with: sudo gem install cocoapods"
      exit 1
    fi
    echo "✅ Pods installed"
    ;;
  "build")
    echo "🔨 Building iOS app..."
    if command -v pod >/dev/null 2>&1; then
      pod install
    else
      echo "❌ CocoaPods not found. Please install with: sudo gem install cocoapods"
      exit 1
    fi
    cd "$PROJECT_ROOT"
    npx react-native run-ios --configuration Release
    echo "✅ iOS build completed"
    ;;
  "simulator")
    echo "📱 Running in iOS Simulator..."
    if command -v pod >/dev/null 2>&1; then
      pod install
    else
      echo "❌ CocoaPods not found. Please install with: sudo gem install cocoapods"
      exit 1
    fi
    cd "$PROJECT_ROOT"
    npx react-native run-ios
    echo "✅ Simulator launched"
    ;;
  *)
    echo "Usage: $0 [clean|pods|build|simulator]"
    echo ""
    echo "Commands:"
    echo "  clean     - Clean all build artifacts"
    echo "  pods      - Install/update CocoaPods"
    echo "  build     - Build for release"
    echo "  simulator - Run in iOS Simulator"
    exit 1
    ;;
esac