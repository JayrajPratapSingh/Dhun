import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, typography} from '../theme/theme';
import {useLibrary} from '../context/LibraryContext';
import {useAuth} from '../context/AuthContext';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';

export default function LibraryScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {favorites, recent} = useLibrary();
  const {isGuest} = useAuth();
  const play = usePlay();
  const [tab, setTab] = useState('favorites');

  const data = tab === 'favorites' ? favorites : recent;

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.md}]}>
      <Text style={[typography.h1, styles.title]}>Your Library</Text>

      <View style={styles.tabs}>
        <Tab label="Liked" active={tab === 'favorites'} onPress={() => setTab('favorites')} />
        <Tab label="Recently played" active={tab === 'recent'} onPress={() => setTab('recent')} />
      </View>

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
          <Text style={styles.guestText}>
            You’re browsing as a guest. Sign in to keep your library across devices.
          </Text>
        </View>
      )}

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name={tab === 'favorites' ? 'heart-outline' : 'time-outline'}
            size={48}
            color={colors.textFaint}
          />
          <Text style={styles.emptyTitle}>
            {tab === 'favorites' ? 'No liked songs yet' : 'Nothing played yet'}
          </Text>
          <Text style={styles.emptySub}>
            {tab === 'favorites'
              ? 'Tap the heart on any track to save it here.'
              : 'Tracks you play will show up here.'}
          </Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.ctaText}>Discover music</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {data.length > 0 && (
            <TouchableOpacity style={styles.playAll} onPress={() => play(data, 0)}>
              <Ionicons name="play-circle" size={30} color={colors.primary} />
              <Text style={styles.playAllText}>Play all</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={data}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
            renderItem={({item, index}) => (
              <TrackRow track={item} index={index} onPress={() => play(data, index)} />
            )}
          />
        </>
      )}
    </View>
  );
}

function Tab({label, active, onPress}) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  title: {paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  tabs: {flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm},
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  tabActive: {backgroundColor: colors.primary},
  tabText: {color: colors.textMuted, fontWeight: '700', fontSize: 13},
  tabTextActive: {color: '#000'},
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(245,197,24,0.1)',
  },
  guestText: {color: colors.textMuted, flex: 1, fontSize: 12, marginLeft: 6},
  playAll: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  playAllText: {color: colors.text, fontWeight: '700', marginLeft: spacing.sm, fontSize: 15},
  empty: {alignItems: 'center', marginTop: spacing.xxl * 1.5, paddingHorizontal: spacing.xl},
  emptyTitle: {...typography.h3, marginTop: spacing.md},
  emptySub: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm},
  cta: {marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: 999},
  ctaText: {color: '#000', fontWeight: '800'},
});
