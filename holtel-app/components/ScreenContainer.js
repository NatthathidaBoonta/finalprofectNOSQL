import React from 'react';
import { View, StyleSheet, Platform, ScrollView, useWindowDimensions } from 'react-native';
import theme from '../utils/theme';

export default function ScreenContainer({ children, style, contentContainerStyle, noScroll, fullWidth = false }) {
  const { width } = useWindowDimensions();

  const maxWidth = Math.min(1100, Math.max(640, width - 64));

  const containerStyle = [
    styles.center,
    { maxWidth: fullWidth ? '100%' : maxWidth },
    // when outer scroll is disabled, allow inner content to stretch
    noScroll ? { flex: 1 } : null,
    contentContainerStyle,
  ];

  const content = <View style={containerStyle}>{children}</View>;

  return (
    <View style={[styles.root, style]}>
      <View style={styles.backgroundLayer} pointerEvents="none" />
      {noScroll ? content : (
        <ScrollView contentContainerStyle={[styles.scrollWrapper, styles.scrollGrow]}>
          {content}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    width: '100%',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scrollWrapper: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 12,
    alignItems: 'center',
  },
  scrollGrow: {
    flexGrow: 1,
  },
  center: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
    minHeight: 200,
  },
});
