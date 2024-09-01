// import React, { useState, useRef, useEffect } from 'react';
// import { View, Button, StyleSheet } from 'react-native';
// import { RNCamera } from 'react-native-camera';
// import ViewShot from 'react-native-view-shot';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Buffer } from 'buffer';
// import LiveTop from '../components/LiveTop';
// import MessageInput from '../components/Message';

// const CameraCaptureScreen = () => {
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
//   const [socket, setSocket] = useState(null);
//   const [clientId, setClientId] = useState(null);
//   const [host, setHost] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const cameraRef = useRef(null);
//   const viewShotRef = useRef(null);
//   const captureInterval = useRef(null);

//   useEffect(() => {
//     const fetchClientIdAndHost = async () => {
//       try {
//         const clientId = await AsyncStorage.getItem('nickname');
//         const host = await AsyncStorage.getItem('host');
//         console.log('ClientId:', clientId);
//         console.log('Host:', host);
//         if (clientId && host) {
//           setClientId(clientId);
//           setHost(host);
//         } else {
//           console.error('ClientId or Host is missing');
//         }
//       } catch (error) {
//         console.error('Failed to retrieve clientId or host from AsyncStorage', error);
//       }
//     };
//     fetchClientIdAndHost();
//   }, []);

//   useEffect(() => {
//     if (host && clientId) { // host와 clientId가 존재하는 경우에만 WebSocket 연결 시도
//       const ws = new WebSocket(`ws://192.168.0.2:8000/ws/${host}/${clientId}`);
      
//       ws.onopen = () => {
//         console.log('WebSocket connected');
//       };

//       ws.onmessage = (event) => {
//         console.log('Received message:', event.data);
//         try {
//           const data = JSON.parse(event.data);
//           if (data.type === 'text') {
//             const formattedMessage = `${data.sender}: ${data.content}`;
//             setMessages(prevMessages => [...prevMessages, formattedMessage]);
//           } else if (data.type === 'image') {
//             console.log('Received image data, not displaying in chat.');
//           }
//         } catch (error) {
//           console.error("Failed to parse WebSocket message", error);
//         }
//       };
      
//       ws.onclose = () => {
//         console.log('WebSocket disconnected');
//         stopCapturing(); // 소켓이 닫힐 때 캡처 작업도 중지
//       };
      
//       ws.onerror = (error) => {
//         console.log('WebSocket error:', error);
//       };
      
//       setSocket(ws);
  
//       return () => {
//         ws.close();
//         clearInterval(captureInterval.current); // 컴포넌트 언마운트 시 캡처 정리
//       };
//     }
//   }, [host, clientId]);

//   async function sendImageToServer(imageBase64) {
//     try {
//       if (socket && socket.readyState === WebSocket.OPEN) {
//         const messageObject = { type: "image", content: imageBase64, sender: clientId };
//         socket.send(JSON.stringify(messageObject)); // WebSocket을 통해 이미지 데이터 전송
//         console.log('Sent image message:', messageObject);
//       }
//     } catch (error) {
//       console.error("Error sending image to server: ", error);
//     }
//   }

//   const startCapturing = () => {
//     setIsCapturing(true);
//     captureInterval.current = setInterval(() => {
//       viewShotRef.current.capture({ quality: 0.5, format: 'jpg' }).then((uri) => {
//         fetch(uri)
//           .then((res) => res.blob())
//           .then((blob) => {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//               const base64data = reader.result.split(',')[1];
//               sendImageToServer(base64data); // 서버로 이미지 데이터 전송
//             };
//             reader.readAsDataURL(blob);
//           });
//       });
//     }, 100);  // 캡처 주기를 줄여 화질이 낮을 때 더 빠르게 전송 가능
//   };

//   const stopCapturing = () => {
//     setIsCapturing(false);
//     clearInterval(captureInterval.current);
//   };

//   // 카메라 전환 함수
//   const toggleCameraType = () => {
//     setCameraType((prevType) =>
//       prevType === RNCamera.Constants.Type.back
//         ? RNCamera.Constants.Type.front
//         : RNCamera.Constants.Type.back
//     );
//   };

//   // 메시지 전송 함수 정의
//   const onSendMessage = (message) => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       const messageObject = { type: "text", content: message, sender: clientId };
//       socket.send(JSON.stringify(messageObject));
//       console.log('Sent message:', messageObject);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* LiveTop 컴포넌트 */}
//       <LiveTop onCameraToggle={toggleCameraType} />
      
//       <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.3 }} style={styles.cameraContainer}>
//         <RNCamera
//           ref={cameraRef}
//           style={styles.camera}
//           type={cameraType}
//           captureAudio={false}
//         />
//       </ViewShot>

//       {!isCapturing && (
//         <View style={styles.buttonContainer}>
//           <Button title="방송 시작!" onPress={startCapturing} color="black" />
//         </View>
//       )}

//       <MessageInput messages={messages} onSendMessage={onSendMessage} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   cameraContainer: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   buttonContainer: {
//     position: 'absolute',
//     top: '30%',
//     left: '42%',
//     zIndex: 1000,
//     backgroundColor: 'yellow',
//   },
// });

// export default CameraCaptureScreen;
// ======================================================
import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ViewShot from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import LiveTop from '../components/LiveTop';
import MessageInput from '../components/Message';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { decodeJpeg, imageToTensor, drawBoundingBoxes } from 'react-native-tflite';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

const CameraCaptureScreen = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const [socket, setSocket] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [host, setHost] = useState(null);
  const [messages, setMessages] = useState([]);
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  const captureInterval = useRef(null);
  const modelRef = useRef(null);
  const faceModelRef = useRef(null);
  const carModelRef = useRef(null);

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
    const loadModels = async () => {
      await tf.ready();
      const faceModel = require('../assets/car_detection.tflite');
      const carModel = require('../assets/face_detection.tflite');

      faceModelRef.current = await tf.loadGraphModel(bundleResourceIO(faceModel));
      carModelRef.current = await tf.loadGraphModel(bundleResourceIO(carModel));
    };

    fetchClientIdAndHost();
    loadModels(); // 모델 로드
  }, []);

  useEffect(() => {
    if (host && clientId) { // host와 clientId가 존재하는 경우에만 WebSocket 연결 시도
      const ws = new WebSocket(`ws://192.168.0.23:8000/ws/${host}/${clientId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        console.log('Received message:', event.data);
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

  async function sendImageToServer(imageBase64) {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const messageObject = { type: "image", content: imageBase64, sender: clientId };
        socket.send(JSON.stringify(messageObject)); // WebSocket을 통해 이미지 데이터 전송
        console.log('Sent image message:', messageObject);
      }
    } catch (error) {
      console.error("Error sending image to server: ", error);
    }
  }

  const applyModelAndSendImage = async (imageUri) => {
    if (!modelRef.current) return;
  
    // 1. 모델 적용하여 바운딩 박스 얻기
    const faceBoxes = await detectObjects(imageUri, faceModelRef.current); // 얼굴 검출
    const carBoxes = await detectObjects(imageUri, carModelRef.current); // 차량 검출
  
    // 2. 모자이크 처리
    const mosaicImage = await applyMosaic(imageUri, faceBoxes, carBoxes);
  
    if (mosaicImage) {
      // 3. 소켓으로 이미지 전송
      sendImageToServer(mosaicImage);
    }
  };

  const applyMosaic = async (imageUri, faceBoxes, carBoxes) => {
    try {
      // 1. 이미지 축소
      const scale = 10; // 모자이크 크기 설정 (숫자가 클수록 더 큰 모자이크 효과)
      const resizedImage = await ImageResizer.createResizedImage(imageUri, 100, 100, 'JPEG', 100);
      const resizedUri = resizedImage.uri;
  
      // 2. 축소된 이미지를 원본 크기로 다시 확대
      const originalSizeImage = await ImageResizer.createResizedImage(resizedUri, resizedImage.width * scale, resizedImage.height * scale, 'JPEG', 100);
      
      // 3. 확대된 이미지 파일을 Base64로 변환
      const base64Image = await RNFS.readFile(originalSizeImage.uri, 'base64');
  
      return base64Image;
    } catch (error) {
      console.error('Error applying mosaic:', error);
      return null;
    }
  };

  const startCapturing = () => {
    setIsCapturing(true);
    captureInterval.current = setInterval(() => {
      viewShotRef.current.capture({ quality: 0.5, format: 'jpg' }).then((uri) => {
        fetch(uri)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1];
              sendImageToServer(base64data); // 서버로 이미지 데이터 전송
            };
            reader.readAsDataURL(blob);
          });
      });
    }, 100);  // 캡처 주기를 줄여 화질이 낮을 때 더 빠르게 전송 가능
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

  // 메시지 전송 함수 정의
  const onSendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageObject = { type: "text", content: message, sender: clientId };
      socket.send(JSON.stringify(messageObject));
      console.log('Sent message:', messageObject);
    }
  };

  return (
    <View style={styles.container}>
      {/* LiveTop 컴포넌트 */}
      <LiveTop onCameraToggle={toggleCameraType} />
      
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.3 }} style={styles.cameraContainer}>
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
