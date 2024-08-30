import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';;
import Welcome from './app/index.jsx';
import Login from './app/login.jsx';
import Signup from './app/signup.jsx';
import Main from './app/main.jsx';
import Live from './app/Live.jsx';
import Live_ from './app/Live_.jsx';

// 스택 네비게이터 생성
const Stack = createStackNavigator();

export default function App() {
  return (
    // 네비게이션 컨테이너 설정
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Stack.Screen name="signup" component={Signup} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="main" component={Main} options={{ headerShown: false }} />
        <Stack.Screen name="Live" component={Live} options={{ headerShown: false }} />
        <Stack.Screen name="Live_" component={Live_}  options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}