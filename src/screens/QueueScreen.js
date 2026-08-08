import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, typography} from '../theme/theme';
import {usePlayer} from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';

export default function QueueScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {current, theme} = usePlayer();
  const [queue, setQueue] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const q = await TrackPlayer.getQueue();
      setQueue((q || []).map(t => t._raw || t));
    } catch (e) {
      setQueue([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  useEffect(() => {
    refresh();
  }, [current?.id, refresh]);

  async function jump(index) {
    try {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (e) {}
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.sm}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Up Next</Text>
        <View style={{width: 28}} />
      </View>

      <FlatList
        data={queue}
        keyExtractor={(i, idx) => `${i.id}_${idx}`}
        contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 60}}
        ListEmptyComponent={
          <Text style={styles.empty}>The queue is empty. Play something first.</Text>
        }
        renderItem={({item, index}) => {
          const active = current && String(current.id) === String(item.id);
          return (
            <View style={styles.row}>
              {active && (
                <Ionicons
                  name="volume-medium"
                  size={16}
                  color={theme.primary}
                  style={styles.playing}
                />
              )}
              <View style={{flex: 1}}>
                <TrackRow track={item} onPress={() => jump(index)} active={active} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {...typography.h3},
  row: {flexDirection: 'row', alignItems: 'center'},
  playing: {position: 'absolute', left: -2, zIndex: 1},
  empty: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl},
});
