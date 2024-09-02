import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function LiveTop({ onCameraToggle, onToggleBlur }) {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate('main');
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.topBar}>
      <Image source={require('../assets/images/Liveimage.png')} style={styles.liveIcon} />

      <View style={styles.topRightIcons}>
        <TouchableOpacity onPress={onCameraToggle}>
          <FontAwesome name="camera" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleBlur}>
          <FontAwesome name="shield" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <FontAwesome name="times" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* 모달 창 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>라이브를 종료하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCancel}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1000,
    opacity: 0.8,
  },
  liveIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  liveText: {
    fontSize: 15,
    color: 'gray',
  },
  topRightIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 5,
    backgroundColor: '#FFE500',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
});
