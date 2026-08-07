import {useCallback} from 'react';
import {usePlayer} from '../context/PlayerContext';
import {useLibrary} from '../context/LibraryContext';

// Convenience: play a list starting at `index` AND log the track to recents.
export function usePlay() {
  const {playFromList} = usePlayer();
  const {addRecent} = useLibrary();
  return useCallback(
    async (list, index = 0) => {
      await playFromList(list, index);
      if (list?.[index]) addRecent(list[index]);
    },
    [playFromList, addRecent],
  );
}
