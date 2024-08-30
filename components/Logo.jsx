import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
