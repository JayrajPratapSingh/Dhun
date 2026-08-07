import React, {useState} from 'react';
import {View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {colors} from '../theme/theme';
import {useAuth} from '../context/AuthContext';
import MiniPlayer from '../components/MiniPlayer';
import SplashScreen from '../components/SplashScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatorScreen from '../screens/CreatorScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayerScreen from '../screens/PlayerScreen';
import EqualizerScreen from '../screens/EqualizerScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const AuthStack = createNativeStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Create: ['add-circle', 'add-circle-outline'],
  Library: ['library', 'library-outline'],
  Profile: ['person', 'person-outline'],
};

// Render the persistent MiniPlayer directly above the tab bar.
function AppTabBar(props) {
  return (
    <View>
      <MiniPlayer />
      <BottomTabBar {...props} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <AppTabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({focused, color, size}) => {
          const [on, off] = ICONS[route.name];
          return <Ionicons name={focused ? on : off} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreatorScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator();
function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen name="Tabs" component={MainTabs} />
      <RootStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{presentation: 'modal', animation: 'slide_from_bottom'}}
      />
      <RootStack.Screen
        name="Equalizer"
        component={EqualizerScreen}
        options={{presentation: 'modal', animation: 'slide_from_bottom'}}
      />
      <RootStack.Screen
        name="Account"
        component={AccountSettingsScreen}
        options={{presentation: 'modal', animation: 'slide_from_bottom'}}
      />
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const {user, loading} = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // Show the branded splash until its animation finishes AND auth is restored.
  if (loading || !splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
