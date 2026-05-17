import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SIZES } from '../theme';
import StudentDashboard from '../screens/student/StudentDashboard';
import MyAssignmentsScreen from '../screens/student/MyAssignmentsScreen';
import MyReadingsScreen from '../screens/student/MyReadingsScreen';
import VocabularyScreen from '../screens/student/VocabularyScreen';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const icons: Record<string, string> = {
    Home: 'home-outline',
    Tests: 'document-text-outline',
    Readings: 'book-outline',
    Vocabulary: 'library-outline',
  };
  const iconsFocused: Record<string, string> = {
    Home: 'home',
    Tests: 'document-text',
    Readings: 'book',
    Vocabulary: 'library',
  };

  return (
    <View style={s.tabBarWrapper}>
      <LinearGradient
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.3)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.tabBar}
      >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const onPress = () => { if (!isFocused) navigation.navigate(route.name); };

        if (route.name === 'FAB') {
          return (
            <TouchableOpacity key="fab" style={s.fab} onPress={() => navigation.navigate('AiChat')} activeOpacity={0.85}>
              <Ionicons name="sparkles" size={26} color={COLORS.white} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.name} style={[s.tabItem, isFocused && s.tabItemActive]} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name={(isFocused ? iconsFocused[route.name] : icons[route.name]) as any} size={24} color={isFocused ? '#6D28D9' : COLORS.secondaryLight} />
            {isFocused && <View style={s.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
      </LinearGradient>
    </View>
  );
}

function FabPlaceholder() { return null; }

export default function StudentTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={StudentDashboard} />
      <Tab.Screen name="Tests" component={MyAssignmentsScreen} />
      <Tab.Screen name="FAB" component={FabPlaceholder} />
      <Tab.Screen name="Readings" component={MyReadingsScreen} />
      <Tab.Screen name="Vocabulary" component={VocabularyScreen} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute', bottom: SIZES.navBottomOffset, left: 24, right: 24,
    height: SIZES.navHeight, borderRadius: 999,
    shadowColor: '#1F2687', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 12,
  },
  tabBar: {
    flex: 1, overflow: 'hidden',
    borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  tabItem: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: 'rgba(237,233,254,0.6)',
  },
  activeIndicator: {
    position: 'absolute', bottom: 6, width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#6D28D9',
  },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center', marginTop: -16,
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
});

