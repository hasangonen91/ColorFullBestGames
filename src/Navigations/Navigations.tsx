import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './RootStackParamList';
import MainScreen from '../Main/MainScreen';
import SplashScreen from '../Splash/SplashScreen';
import GameController from '../Games/2048/GameController';
import GameController5x5 from '../Games/2048_5x5/GameController5x5';

// Diğer ekran importlarını buraya ekleyin

const Stack = createStackNavigator<RootStackParamList>();

const Navigations: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="GameController" component={GameController} />
        <Stack.Screen name="GameController5x5" component={GameController5x5} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigations; 