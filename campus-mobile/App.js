import React, { useState, useEffect } from 'react';
// Force Refresh 1.1
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Trophy, HelpCircle, BarChart2, User as UserIcon } from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ChallengesPage from './src/screens/ChallengesPage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChallengeDetailsScreen from './src/screens/ChallengeDetailsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import CreateChallengeScreen from './src/screens/CreateChallengeScreen';
import SubmissionScreen from './src/screens/SubmissionScreen';
import HelpBoardScreen from './src/screens/HelpBoardScreen';
import HelpPostDetailsScreen from './src/screens/HelpPostDetailsScreen';
import CreateHelpPostScreen from './src/screens/CreateHelpPostScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) {
              if (route.name === 'ProfileTab') {
                navigation.navigate('Profile');
              } else if (!isFocused) {
                navigation.navigate(route.name);
              }
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                <Icon color={isFocused ? "#F97316" : "#6B7280"} size={22} />
              </View>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function HomeTabs({ onLogout }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      >
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="ChallengesTab"
        component={ChallengesPage}
        options={{ tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="HelpDeskTab"
        component={HelpBoardScreen}
        options={{ tabBarIcon: ({ color, size }) => <HelpCircle color={color} size={size} /> }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={View}
        options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

function MainScreens({ onLogout }) {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="HomeTabs">
        {(props) => <HomeTabs {...props} onLogout={onLogout} />}
      </MainStack.Screen>
      <MainStack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
      <MainStack.Screen name="Submission" component={SubmissionScreen} /> 
      <MainStack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
      <MainStack.Screen name="CreateHelpPost" component={CreateHelpPostScreen} />
      <MainStack.Screen name="HelpPostDetails" component={HelpPostDetailsScreen} /> 
      <MainStack.Screen 
        name="Profile" 
        options={{ animation: 'flip' }}
      >
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => { checkToken(); }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setUserToken(token);
    } catch (e) {
      console.error('Failed to fetch token', e);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    signIn: async () => {
      const token = await AsyncStorage.getItem('token');
      setUserToken(token);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUserToken(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: '#F97316',
        background: '#FFF7ED',
        card: '#FFFFFF',
        text: '#1F2937',
        border: '#FED7AA',
        notification: '#F59E0B',
      }
    }}>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoginSuccess={authContext.signIn} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main">
            {(props) => <MainScreens {...props} onLogout={authContext.signOut} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#FFF1E6',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F97316',
  }
});
