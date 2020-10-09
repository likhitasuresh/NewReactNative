import 'react-native-gesture-handler';
import React from 'react';
import { Button, View, Text } from 'react-native';
import {NavigationContainer, useLinkProps} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './Components/Home';
import Chat from './Components/Chat';
import DetailedChat from './Components/DetailedChat';
import { NewChat } from './Components/NewChat';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      
        <Stack.Screen
          name="Home"
          component={Home}
       />
      <Stack.Screen
        name="Chat"
        component={Chat}
      />
      <Stack.Screen
        name="NewChat"
        component={NewChat}
        options={{ title: "Brynn Tarth" }}
      />
      <Stack.Screen
          name="DetailedChat"
          component={DetailedChat}
          options={{ title: "Chat" }}
       />
     </Stack.Navigator>
   </NavigationContainer>
  );
}