import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BottomTab() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://172.30.1.98:8000/user/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
        await AsyncStorage.removeItem('token');
        navigation.navigate('login');
      } else {
        Alert.alert('로그아웃 실패', '로그아웃을 완료할 수 없습니다.');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('로그아웃 오류', '서버와 연결할 수 없습니다.');
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('회원 탈퇴 오류', '회원을 찾을 수 없습니다.');
        return;
      }
      const response = await fetch('http://172.30.1.98:8000/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('회원 탈퇴', '계정이 성공적으로 삭제되었습니다.');
        navigation.navigate('signup');
        await AsyncStorage.removeItem('token');
      } else {
        Alert.alert('회원 탈퇴 실패', data.detail || '회원 탈퇴를 완료할 수 없습니다.');
      }
    } catch (error) {
      console.error('Delete Account Error:', error);
      Alert.alert('회원 탈퇴 오류', '서버와 연결할 수 없습니다.');
    }
  };

  const handleAddPress = async () => {
    try {
      const clientId = await AsyncStorage.getItem('nickname');
      if (clientId) {
        await AsyncStorage.setItem('host', clientId);
        navigation.navigate('Live');
      } else {
        Alert.alert('Error', 'Client ID not found.');
      }
    } catch (error) {
      console.error('Failed to retrieve clientId from AsyncStorage', error);
    }
  };

  const handleUserPress = () => {
    Alert.alert(
      "사용자 선택",
      "원하는 기능을 선택하시오.",
      [
        { text: "로그아웃", onPress: () => console.log("로그아웃 선택") },
        { text: "회원탈퇴", onPress: () => console.log("회원탈퇴 선택") },
        { text: "취소", style: "cancel" }
      ]
    );
  };

  const handleHomePress = () => {
    navigation.replace('main');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleHomePress}>
        <FontAwesome name="home" size={28} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Image source={require('../assets/images/BottomTab+.png')} style={styles.addButtonImage} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUserPress}>
        <FontAwesome name="user" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#FFE600',
  },
  addButton: {
    backgroundColor: 'black',
    borderRadius: 35,
    padding: 10,
    marginTop: -40,
  },
  addButtonImage: {
    width: 50,
    height: 50,
  },
});
