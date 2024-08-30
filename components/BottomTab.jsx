import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BottomTab() {
  const navigation = useNavigation();

  const handleAddPress = async () => {
    try {
      const clientId = await AsyncStorage.getItem('nickname');
      console.log('clientId', clientId);
      console.log('Live', { host: clientId });
      await AsyncStorage.setItem('host', clientId);
      navigation.navigate('Live');
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
