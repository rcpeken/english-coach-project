import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SIZES } from '../theme';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import MyTestsScreen from '../screens/teacher/MyTestsScreen';
import MyPassagesScreen from '../screens/teacher/MyPassagesScreen';
import MyStudentsScreen from '../screens/teacher/MyStudentsScreen';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const icons: Record<string, string> = {
    Home: 'home-outline',
    Tests: 'document-text-outline',
    Students: 'people-outline',
    Passages: 'book-outline',
  };
  const iconsFocused: Record<string, string> = {
    Home: 'home',
    Tests: 'document-text',
    Students: 'people',
    Passages: 'book',
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
            <TouchableOpacity key="fab" style={s.fab} onPress={() => navigation.navigate('CreateTest')} activeOpacity={0.85}>
              <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.name} style={[s.tabItem, isFocused && s.tabItemActive]} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name={(isFocused ? iconsFocused[route.name] : icons[route.name]) as any} size={24} color={isFocused ? COLORS.primary : COLORS.secondaryLight} />
            {isFocused && <View style={s.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
      </LinearGradient>
    </View>
  );
}

function FabPlaceholder() { return null; }

export default function TeacherTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={TeacherDashboard} />
      <Tab.Screen name="Tests" component={MyTestsScreen} />
      <Tab.Screen name="FAB" component={FabPlaceholder} />
      <Tab.Screen name="Students" component={MyStudentsScreen} />
      <Tab.Screen name="Passages" component={MyPassagesScreen} />
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
    backgroundColor: 'rgba(241,245,249,0.6)',
  },
  activeIndicator: {
    position: 'absolute', bottom: 6, width: 5, height: 5, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginTop: -16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
});

