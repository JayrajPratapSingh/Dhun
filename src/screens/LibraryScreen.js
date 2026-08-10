import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useLibrary} from '../context/LibraryContext';
import {usePlaylists} from '../context/PlaylistsContext';
import {useDownloads} from '../context/DownloadsContext';
import {useAuth} from '../context/AuthContext';
import {useI18n} from '../i18n/LanguageContext';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';

export default function LibraryScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const {favorites, recent} = useLibrary();
  const {playlists, createPlaylist} = usePlaylists();
  const {downloads, removeDownload} = useDownloads();
  const {isGuest} = useAuth();
  const {t} = useI18n();
  const play = usePlay();
  const [tab, setTab] = useState('favorites');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  // Let other screens deep-link to a tab, e.g. Profile > Audio & downloads.
  // The param is cleared once consumed so navigating here again still works.
  const requestedTab = route?.params?.tab;
  useEffect(() => {
    if (!requestedTab) return;
    setTab(requestedTab);
    navigation.setParams({tab: undefined});
  }, [requestedTab, navigation]);

  const data = tab === 'favorites' ? favorites : recent;
  // Clear the mini player and tab bar (which now carries the bottom inset).
  const listContent = {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140 + insets.bottom,
  };

  function doCreate() {
    if (!newName.trim()) return;
    createPlaylist(newName);
    setNewName('');
    setShowCreate(false);
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.md}]}>
      <Text style={[typography.h1, styles.title]}>{t('your_library')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}>
        <Tab label={t('liked')} active={tab === 'favorites'} onPress={() => setTab('favorites')} />
        <Tab label={t('playlists')} active={tab === 'playlists'} onPress={() => setTab('playlists')} />
        <Tab label={t('downloads')} active={tab === 'downloads'} onPress={() => setTab('downloads')} />
        <Tab label={t('recent')} active={tab === 'recent'} onPress={() => setTab('recent')} />
      </ScrollView>

      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
          <Text style={styles.guestText}>
            You’re browsing as a guest. Sign in to keep your library across devices.
          </Text>
        </View>
      )}

      {tab === 'playlists' ? (
        <>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add-circle" size={26} color={colors.primary} />
            <Text style={styles.newBtnText}>{t('new_playlist')}</Text>
          </TouchableOpacity>
          {playlists.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="albums-outline" size={48} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No playlists yet</Text>
              <Text style={styles.emptySub}>
                Create one, then add songs with the “+” on any track.
              </Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={i => i.id}
              contentContainerStyle={listContent}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.plRow}
                  onPress={() => navigation.navigate('PlaylistDetail', {id: item.id})}>
                  <View style={styles.plIcon}>
                    <Ionicons name="musical-notes" size={22} color={colors.primary} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.plName}>{item.name}</Text>
                    <Text style={styles.plCount}>{item.tracks.length} songs</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : tab === 'downloads' ? (
        downloads.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="download-outline" size={48} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySub}>
              Tap “Download” on the player to save songs for offline listening.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.playAll} onPress={() => play(downloads, 0)}>
              <Ionicons name="play-circle" size={30} color={colors.primary} />
              <Text style={styles.playAllText}>{t('play_all_offline')}</Text>
            </TouchableOpacity>
            <FlatList
              data={downloads}
              keyExtractor={i => String(i.id)}
              contentContainerStyle={listContent}
              renderItem={({item, index}) => (
                <View style={styles.plRowInline}>
                  <View style={{flex: 1}}>
                    <TrackRow track={item} onPress={() => play(downloads, index)} />
                  </View>
                  <TouchableOpacity
                    onPress={() => removeDownload(item.id)}
                    hitSlop={8}
                    style={{padding: 8}}>
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )
      ) : data.length === 0 ? (
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
          <TouchableOpacity style={styles.playAll} onPress={() => play(data, 0)}>
            <Ionicons name="play-circle" size={30} color={colors.primary} />
            <Text style={styles.playAllText}>{t('play_all')}</Text>
          </TouchableOpacity>
          <FlatList
            data={data}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={listContent}
            renderItem={({item, index}) => (
              <TrackRow track={item} index={index} onPress={() => play(data, index)} />
            )}
          />
        </>
      )}

      {/* Create playlist modal */}
      <Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowCreate(false)}>
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('new_playlist')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('new_playlist')}
              placeholderTextColor={colors.textFaint}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.dialogBtns}>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={doCreate}>
                <Text style={styles.createText}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  // A horizontal ScrollView in a column parent grows to fill the leftover
  // height, which stretched the pills into full-screen bars. Pin it to its
  // content instead.
  tabsScroll: {flexGrow: 0, flexShrink: 0, marginBottom: spacing.md},
  // alignItems keeps the pills at their natural height rather than stretching.
  tabs: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm},
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.card,
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
  // These rows already space their children with `gap`; an extra marginLeft on
  // the label doubled it.
  guestText: {color: colors.textMuted, flex: 1, fontSize: 12},
  playAll: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  playAllText: {color: colors.text, fontWeight: '700', fontSize: 15},
  newBtn: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  newBtnText: {color: colors.text, fontWeight: '700', fontSize: 15},
  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  plIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  plRowInline: {flexDirection: 'row', alignItems: 'center'},
  plName: {color: colors.text, fontSize: 15, fontWeight: '700'},
  plCount: {color: colors.textMuted, fontSize: 12, marginTop: 2},
  empty: {alignItems: 'center', marginTop: spacing.xxl * 1.5, paddingHorizontal: spacing.xl},
  emptyTitle: {...typography.h3, marginTop: spacing.md},
  emptySub: {color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm},
  cta: {marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: 999},
  ctaText: {color: '#000', fontWeight: '800'},
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  dialog: {width: '100%', backgroundColor: colors.bgElevated, borderRadius: radius.lg, padding: spacing.lg},
  dialogTitle: {...typography.h3, marginBottom: spacing.md},
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogBtns: {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xl, marginTop: spacing.lg},
  cancelText: {color: colors.textMuted, fontWeight: '700', paddingHorizontal: spacing.md},
  createBtn: {backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 10, borderRadius: radius.pill},
  createText: {color: '#000', fontWeight: '800'},
});
