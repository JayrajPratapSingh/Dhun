import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing} from '../theme/theme';

// Large horizontal-carousel artwork card used on Home.
export default function TrackCard({track, onPress, width = 150}) {
  return (
    <TouchableOpacity style={[styles.card, {width}]} onPress={onPress} activeOpacity={0.85}>
      {track.artwork ? (
        <Image source={{uri: track.artwork}} style={[styles.art, {width, height: width}]} />
      ) : (
        <View style={[styles.art, styles.fallback, {width, height: width}]}>
          <Ionicons name="musical-notes" size={30} color={colors.textFaint} />
        </View>
      )}
      <Text numberOfLines={1} style={styles.title}>
        {track.title}
      </Text>
      <Text numberOfLines={1} style={styles.artist}>
        {track.artist}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {marginRight: spacing.lg},
  art: {borderRadius: radius.md, backgroundColor: colors.card},
  fallback: {alignItems: 'center', justifyContent: 'center'},
  title: {color: colors.text, fontSize: 14, fontWeight: '700', marginTop: spacing.sm},
  artist: {color: colors.textMuted, fontSize: 12, marginTop: 2},
});
