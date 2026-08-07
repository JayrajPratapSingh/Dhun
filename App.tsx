/**
 * HiRes Music — free hi-fi streaming, powered by Audius.
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './src/context/AuthContext';
import {LibraryProvider} from './src/context/LibraryContext';
import {UploadsProvider} from './src/context/UploadsContext';
import {PlayerProvider} from './src/context/PlayerContext';
import RootNavigator from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0F" />
      <AuthProvider>
        <LibraryProvider>
          <UploadsProvider>
            <PlayerProvider>
              <RootNavigator />
            </PlayerProvider>
          </UploadsProvider>
        </LibraryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
