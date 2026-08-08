import {useCallback} from 'react';
import {usePlayer} from '../context/PlayerContext';
import {useLibrary} from '../context/LibraryContext';
import {useDownloads} from '../context/DownloadsContext';

// Convenience: play a list starting at `index`, prefer offline files for
// downloaded tracks, and log the played track to recents.
export function usePlay() {
  const {playFromList} = usePlayer();
  const {addRecent} = useLibrary();
  const {getLocalUrl} = useDownloads();
  return useCallback(
    async (list, index = 0) => {
      // Swap in the local file URL for any track that's downloaded.
      const mapped = (list || []).map(t => {
        const local = getLocalUrl(t.id);
        return local ? {...t, url: local} : t;
      });
      await playFromList(mapped, index);
      if (list?.[index]) addRecent(list[index]);
    },
    [playFromList, addRecent, getLocalUrl],
  );
}
