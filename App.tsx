/**
 * HiRes Music — free hi-fi streaming, powered by Audius.
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {LanguageProvider} from './src/i18n/LanguageContext';
import {AuthProvider} from './src/context/AuthContext';
import {LibraryProvider} from './src/context/LibraryContext';
import {PlaylistsProvider} from './src/context/PlaylistsContext';
import {DownloadsProvider} from './src/context/DownloadsContext';
import {SettingsProvider} from './src/context/SettingsContext';
import {UploadsProvider} from './src/context/UploadsContext';
import {PlayerProvider} from './src/context/PlayerContext';
import RootNavigator from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0F" />
      <LanguageProvider>
      <AuthProvider>
        <LibraryProvider>
          <PlaylistsProvider>
            <DownloadsProvider>
              <UploadsProvider>
                <SettingsProvider>
                  <PlayerProvider>
                    <RootNavigator />
                  </PlayerProvider>
                </SettingsProvider>
              </UploadsProvider>
            </DownloadsProvider>
          </PlaylistsProvider>
        </LibraryProvider>
      </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
