import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../theme/theme';

export default function Loader({label = 'Loading…'}) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {!!label && <Text style={styles.text}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  text: {color: colors.textMuted, marginTop: spacing.md, fontSize: 14},
});
