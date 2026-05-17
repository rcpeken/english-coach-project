import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/components/CustomAlert';
import AppNavigator from './src/navigation/AppNavigator';

const glassTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  let [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AlertProvider>
        <LinearGradient
          colors={['#7BB4F5', '#5CEBC4', '#FFB070', '#62CCF5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <NavigationContainer theme={glassTheme}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </LinearGradient>
      </AlertProvider>
    </AuthProvider>
  );
}
