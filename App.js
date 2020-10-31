import 'react-native-gesture-handler';
import React from 'react';
import { Button, View, Text } from 'react-native';
import {NavigationContainer, useLinkProps} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './Components/Home';
import Chat from './Components/Chat';
import DetailedChat from './Components/DetailedChat';
import  NewChat  from './Components/NewChat';
import CreateNewChannel from './Components/CreateNewChannel';
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
        options={{
          title: "Chats", 
          headerStyle: {
            backgroundColor: '#5386c9',
          },         
        }}
        
      />
      <Stack.Screen
        name="NewChat"
        component={NewChat}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
          name="DetailedChat"
          component={DetailedChat}
          options={{ title: "Chat" }}
       />
       <Stack.Screen
          name="CreateNewChannel"
          component={CreateNewChannel}  
          options={{ title: "New Chat" }}        
       />
     </Stack.Navigator>
   </NavigationContainer>
  );
}