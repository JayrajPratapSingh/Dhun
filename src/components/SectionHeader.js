import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors, spacing, typography} from '../theme/theme';

export default function SectionHeader({title, actionLabel, onAction}) {
  return (
    <View style={styles.row}>
      <Text style={typography.h2}>{title}</Text>
      {!!actionLabel && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  action: {color: colors.primary, fontWeight: '700', fontSize: 13},
});
