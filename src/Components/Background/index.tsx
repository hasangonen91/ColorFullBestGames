import React, { ReactNode } from 'react';
import { SafeAreaView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { styles } from './styles';
import { theme as themeObj } from '../../global/styles/theme';

type Props = {
  children: ReactNode;
  theme?: 'light' | 'dark';
}

export function Background({ children, theme = 'light' }: Props) {
  if (theme === 'dark') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeObj.colors.secondary100 }}>
        <View style={{ flex: 1, backgroundColor: themeObj.colors.secondary100 }}>
          {children}
        </View>
      </SafeAreaView>
    );
  }
  // Light mode
  const colors = [themeObj.colors.secondary80, themeObj.colors.secondary100];
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <LinearGradient
      style={styles.container}
        colors={colors}
    >
      {children}
    </LinearGradient>
    </SafeAreaView>
  )
}