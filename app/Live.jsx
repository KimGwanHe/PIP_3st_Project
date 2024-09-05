import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ViewShot from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LiveTop from '../components/LiveTop';
import MessageInput from '../components/Message';

const CameraCaptureScreen = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const [socket, setSocket] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [host, setHost] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  const captureInterval = useRef(null);

  const isBlurEnabledRef = useRef(isBlurEnabled);

  useEffect(() => {
    isBlurEnabledRef.current = isBlurEnabled;
  }, [isBlurEnabled]);

  useEffect(() => {
    const fetchClientIdAndHost = async () => {
      try {
        const clientId = await AsyncStorage.getItem('nickname');
        const host = await AsyncStorage.getItem('host');
        console.log('ClientId:', clientId);
        console.log('Host:', host);
        if (clientId && host) {
          setClientId(clientId);
          setHost(host);
        } else {
          console.error('ClientId or Host is missing');
        }
      } catch (error) {
        console.error('Failed to retrieve clientId or host from AsyncStorage', error);
      }
    };

    fetchClientIdAndHost();
  }, []);

  useEffect(() => {
    if (host && clientId) { // host와 clientId가 존재하는 경우에만 WebSocket 연결 시도
      const ws = new WebSocket(`ws://192.168.45.119:8000/ws/${host}/${clientId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        // console.log('Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'text') {
            const formattedMessage = `${data.sender}: ${data.content}`;
            setMessages(prevMessages => [...prevMessages, formattedMessage]);
          } else if (data.type === 'image') {
            console.log('Received image data, not displaying in chat.');
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message", error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        stopCapturing(); // 소켓이 닫힐 때 캡처 작업도 중지
      };
      
      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };
      
      setSocket(ws);
  
      return () => {
        ws.close();
        clearInterval(captureInterval.current); // 컴포넌트 언마운트 시 캡처 정리
      };
    }
  }, [host, clientId]);


  async function processAndSendImage(uri) {
    // 이미지 불러오기
    const response = await fetch(uri);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];

      if (isBlurEnabledRef.current) {
        // 블러가 활성화된 경우 서버에 요청하여 블러 처리된 이미지를 전송합니다.
        fetch(`http://192.168.45.119:8000/stream/blur/${host}/${clientId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data }),
        })
      } else {
        // 블러가 비활성화된 경우 기본 이미지를 전송합니다.
        fetch(`http://192.168.45.119:8000/stream/normal/${host}/${clientId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data }),
        })
      }
    };
    reader.readAsDataURL(blob);
  }

  const startCapturing = () => {
    setIsCapturing(true);
    captureInterval.current = setInterval(() => {
      viewShotRef.current.capture({ quality: 0.1, format: 'jpg' }).then((uri) => {
        processAndSendImage(uri); // 이미지 처리 및 전송
      });
    }, 175); // 0.175초
  };

  const stopCapturing = () => {
    setIsCapturing(false);
    clearInterval(captureInterval.current);
  };

  // 카메라 전환 함수
  const toggleCameraType = () => {
    setCameraType((prevType) =>
      prevType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back
    );
  };

  // 블러 처리 상태 변경 함수
  const toggleBlur = () => {
    console.log(isBlurEnabled)
    setIsBlurEnabled(prevState => !prevState);
    // setIsBlurEnabled(!isBlurEnabled);
  };

  // 메시지 전송 함수 정의
  const onSendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageObject = { type: "text", content: message, sender: clientId };
      socket.send(JSON.stringify(messageObject));
      // console.log('Sent message:', messageObject);
    }
  };

  return (
    <View style={styles.container}>
      {/* LiveTop 컴포넌트 */}
      <LiveTop onCameraToggle={toggleCameraType} onToggleBlur={toggleBlur} />
      
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.1 }} style={styles.cameraContainer}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          captureAudio={false}
        />
      </ViewShot>

      {!isCapturing && (
        <View style={styles.buttonContainer}>
          <Button title="방송 시작!" onPress={startCapturing} color="black" />
        </View>
      )}

      <MessageInput messages={messages} onSendMessage={onSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: '30%',
    left: '42%',
    zIndex: 1000,
    backgroundColor: 'yellow',
  },
});

export default CameraCaptureScreen;
