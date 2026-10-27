import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/HomeDashboard/HomeScreen/Home';
import Login from '../screens/AuthFiles/LoginScreen/LoginScreen';
import ProfileScreen from '../screens/ProfileUnit/ProfileScreen/ProfileScreen';
import LeadActionScreen from "../screens/LeadActions/LeadActionScreen"
import LeadActivityDetailsScreen from "../screens/LeadActions/LeadActivityDetailsScreen"
import NotificationScreen from '../screens/NotificationScreen/NotificationScreen'

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home" // start with Login screen
      screenOptions={{ headerShown: false }} // hide headers globally
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name='NotificationScreen' component={NotificationScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="LeadActionScreen" component={LeadActionScreen} />
      <Stack.Screen
        name="LeadActivityDetails"
        component={LeadActivityDetailsScreen}
      />

    </Stack.Navigator>
  );
};

export default AuthNavigation;
