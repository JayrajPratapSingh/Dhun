import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  pick,
  keepLocalCopy,
  types,
  errorCodes,
  isErrorWithCode,
} from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radius, spacing, typography} from '../theme/theme';
import {useUploads} from '../context/UploadsContext';
import {useAuth} from '../context/AuthContext';
import {usePlay} from '../hooks/usePlay';
import TrackRow from '../components/TrackRow';

export default function CreatorScreen() {
  const insets = useSafeAreaInsets();
  const {uploads, addUpload, removeUpload} = useUploads();
  const {user} = useAuth();
  const play = usePlay();

  const [pending, setPending] = useState(null); // {name, uri, size}
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  async function pickFile() {
    try {
      const [file] = await pick({type: [types.audio]});
      if (!file) return;
      // On Android the picked uri is a content:// uri; copy it into the app's
      // cache to get a stable file:// path that track-player can stream.
      let uri = file.uri;
      try {
        const [copy] = await keepLocalCopy({
          files: [{uri: file.uri, fileName: file.name || `audio_${Date.now()}`}],
          destination: 'cachesDirectory',
        });
        if (copy?.status === 'success') uri = copy.localUri;
      } catch (_) {
        // fall back to the original uri if copying fails
      }
      const base = (file.name || 'audio').replace(/\.[^/.]+$/, '');
      setPending({name: file.name, uri, size: file.size});
      setTitle(base);
      setArtist(user?.name && !user?.guest ? user.name : 'Me');
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Could not pick file', String(e?.message || e));
    }
  }

  function publish() {
    if (!pending?.uri) return;
    if (!title.trim()) {
      Alert.alert('Add a title', 'Please give your track a title.');
      return;
    }
    const track = {
      id: `up_${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || 'Me',
      url: pending.uri, // local file path -> player uses it directly
      artwork: null,
      artworkLarge: null,
      duration: 0,
      isUpload: true,
      uploadedAt: Date.now(),
    };
    addUpload(track);
    setPending(null);
    setTitle('');
    setArtist('');
  }

  function confirmDelete(item) {
    Alert.alert('Remove upload', `Remove “${item.title}” from your uploads?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: () => removeUpload(item.id)},
    ]);
  }

  return (
    <View style={[styles.flex, {paddingTop: insets.top + spacing.md}]}>
      <Text style={[typography.h1, styles.title]}>Creator Studio</Text>
      <Text style={styles.subtitle}>
        Upload tracks from your device and play them anytime.
      </Text>

      {/* Upload card / form */}
      {!pending ? (
        <TouchableOpacity style={styles.dropzone} onPress={pickFile} activeOpacity={0.85}>
          <View style={styles.dzIcon}>
            <Ionicons name="cloud-upload-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.dzTitle}>Choose an audio file</Text>
          <Text style={styles.dzSub}>MP3, WAV, FLAC, M4A…</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.form}>
          <View style={styles.fileRow}>
            <Ionicons name="musical-note" size={18} color={colors.primary} />
            <Text numberOfLines={1} style={styles.fileName}>
              {pending.name}
            </Text>
            <TouchableOpacity onPress={() => setPending(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Track title"
            placeholderTextColor={colors.textFaint}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Artist"
            placeholderTextColor={colors.textFaint}
            value={artist}
            onChangeText={setArtist}
          />
          <TouchableOpacity style={styles.publishBtn} onPress={publish}>
            <Ionicons name="checkmark-circle" size={20} color="#000" />
            <Text style={styles.publishText}>Publish to my library</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Uploads list */}
      <View style={styles.listHeader}>
        <Text style={typography.h3}>My uploads</Text>
        <Text style={styles.count}>{uploads.length}</Text>
      </View>

      {uploads.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="albums-outline" size={44} color={colors.textFaint} />
          <Text style={styles.emptyText}>No uploads yet</Text>
        </View>
      ) : (
        <FlatList
          data={uploads}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={{paddingHorizontal: spacing.lg, paddingBottom: 140}}
          renderItem={({item, index}) => (
            <View style={styles.uploadRow}>
              <View style={{flex: 1}}>
                <TrackRow track={item} onPress={() => play(uploads, index)} />
              </View>
              <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8} style={styles.del}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  title: {paddingHorizontal: spacing.lg},
  subtitle: {color: colors.textMuted, paddingHorizontal: spacing.lg, marginTop: 4, marginBottom: spacing.lg},
  dropzone: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  dzIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(29,185,84,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dzTitle: {color: colors.text, fontWeight: '700', fontSize: 16},
  dzSub: {color: colors.textFaint, marginTop: 4, fontSize: 12},
  form: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  fileRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md},
  fileName: {color: colors.text, flex: 1, marginLeft: 8, marginRight: 8, fontWeight: '600'},
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    marginTop: spacing.lg,
  },
  publishText: {color: '#000', fontWeight: '800', marginLeft: 6},
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  count: {color: colors.textMuted, fontWeight: '700'},
  empty: {alignItems: 'center', marginTop: spacing.xxl},
  emptyText: {color: colors.textMuted, marginTop: spacing.md},
  uploadRow: {flexDirection: 'row', alignItems: 'center'},
  del: {padding: 8},
});
