import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Header({nickname}) {
    return (
      <View style={styles.textContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Hi~ {nickname} 님</Text>
          <Image source={require('../assets/images/profile.png')} style={styles.profileImage} />
        </View>
        <Text style={styles.hashtags}>
          #실시간 라이브 #간단하게 시작해보세요!{'\n'}#개인정보 보호 블러처리!
        </Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    textContainer: {
      backgroundColor: '#707070',
      padding: 10,
    },
    welcomeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    welcomeText: {
      fontSize: 24,
      color: '#FAFF0F',
      fontWeight: 'bold',
    },
    profileImage: {
      width: 70,
      height: 70,
    },
    hashtags: {
      color: '#EDEDED',
      marginBottom: 20,
    },
  });