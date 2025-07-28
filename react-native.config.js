module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          sourceDir: '../node_modules/react-native-vector-icons/ios',
          project: 'RNVectorIcons.xcodeproj',
        },
      },
    },
  },
  assets: ['./assets/fonts/', './assets/images/'],
  project: {
    ios: {},
    android: {
      sourceDir: '../android',
      manifestPath: '../android/app/src/main/AndroidManifest.xml',
    },
  },
};