// import React, { useState, useEffect } from 'react';
// import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
// import { RTCView, mediaDevices, RTCPeerConnection } from 'react-native-webrtc';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';

// export default function CameraShare() {
//   const [stream, setStream] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const [ws, setWs] = useState(null);
//   const [clientId, setClientId] = useState(null);
//   const [host, setHost] = useState(null);
//   const [sharing, setSharing] = useState(false); // 카메라 공유 상태를 관리
//   const navigation = useNavigation();

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
//     if (clientId && host) {
//       const wsUrl = `ws://192.168.161.6:8000/ws/${host}/${clientId}`;
//       const wsInstance = connectToWebSocket(wsUrl);
//       if (wsInstance) {
//         setWs(wsInstance);
//         wsInstance.onmessage = (event) => {
//           if (peerConnection) {
//             handleSignaling(peerConnection, event.data);
//           }
//         };
//       } else {
//         console.error('Failed to initialize WebSocket');
//       }
//     }
//   }, [clientId, host]);
//   useEffect(() => {
//     if (peerConnection && ws && sharing) {
//       startSignaling(peerConnection, ws);
//     }
//   }, [peerConnection, ws, sharing]);
//   const requestPermissions = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'This app needs access to your camera.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           Alert.alert('Permission Denied', 'Camera permission is required for screen sharing.');
//           return false;
//         }
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
//     return true;
//   };
//   const startCameraShare = async () => {
//     try {
//       const hasPermission = await requestPermissions();
//       if (!hasPermission) return;
//       const cameraStream = await mediaDevices.getUserMedia({
//         video: true,  // 카메라 비디오 스트림 요청
//         audio: false, // 오디오 비활성화
//       });
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//       const connection = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//       });
//       cameraStream.getTracks().forEach((track) => {
//         connection.addTrack(track, cameraStream);
//       });
//       setStream(cameraStream);
//       setPeerConnection(connection);
//       setSharing(true);
//     } catch (error) {
//       console.error('Camera sharing error: ', error);
//       Alert.alert('Error', 'Failed to start camera sharing.');
//     }
//   };
//   const handleStartButtonPress = () => {
//     startCameraShare();
//   };
//   const handleStopButtonPress = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     if (peerConnection) {
//       peerConnection.close();
//       setPeerConnection(null);
//     }
//     setSharing(false);
//   };
//   return (
//     <View style={styles.container}>
//       <Button
//         title={sharing ? 'Stop Sharing' : 'Start Sharing'}
//         onPress={sharing ? handleStopButtonPress : handleStartButtonPress}
//       />
//       {stream && <RTCView streamURL={stream.toURL()} style={styles.stream} />}
//     </View>
//   );
// }
// const startSignaling = (pc, ws) => {
//   const createOffer = async () => {
//     try {
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
//     } catch (error) {
//       console.error('Failed to create offer:', error);
//     }
//   };
//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
//     }
//   };
//   ws.onmessage = async (event) => {
//     try {
//       const message = JSON.parse(event.data);
//       if (message.type === 'answer') {
//         await pc.setRemoteDescription({ type: 'answer', sdp: message.sdp });
//       } else if (message.type === 'candidate') {
//         const candidate = new RTCIceCandidate(message.candidate);
//         await pc.addIceCandidate(candidate);
//       }
//     } catch (error) {
//       console.error('Error handling signaling message:', error);
//     }
//   };
//   pc.onnegotiationneeded = createOffer;
// };
// const connectToWebSocket = (url) => {
//   const ws = new WebSocket(url);
//   ws.onopen = () => {
//     console.log('WebSocket connection opened');
//   };
//   ws.onerror = (error) => {
//     console.error('WebSocket error:', error.message);
//   };
//   ws.onclose = () => {
//     console.log('WebSocket connection closed');
//   };
//   return ws;
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stream: {
//     width: '100%',
//     height: '100%',
//   },
// });

// Host.jsx
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Host() {
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [ws, setWs] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [host, setHost] = useState(null);

  useEffect(() => {
    const fetchClientIdAndHost = async () => {
      try {
        const clientId = await AsyncStorage.getItem('nickname');
        const host = await AsyncStorage.getItem('host');
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
    if (clientId && host && !ws) {
      const wsUrl = `ws://192.168.161.6:8000/ws/${host}/${clientId}`;
      const wsInstance = new WebSocket(wsUrl);

      wsInstance.onopen = () => {
        console.log('WebSocket connection opened');
        setWs(wsInstance);
      };

      wsInstance.onerror = (error) => {
        console.error('WebSocket error:', error.message);
      };

      wsInstance.onclose = () => {
        console.log('WebSocket connection closed');
      };

      wsInstance.onmessage = async (event) => {
        if (peerConnection) {
          handleSignaling(peerConnection, event.data);
        }
      };

      setWs(wsInstance);
    }
  }, [clientId, host, ws, peerConnection]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required for screen sharing.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startCameraShare = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const cameraStream = await mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const connection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate);
          ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
      };

      connection.onnegotiationneeded = async () => {
        try {
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          console.log('Offer created and set as local description:', offer);
          ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
        } catch (error) {
          console.error('Error during negotiationneeded event:', error);
        }
      };

      cameraStream.getTracks().forEach((track) => {
        connection.addTrack(track, cameraStream);
      });

      setStream(cameraStream);
      setPeerConnection(connection);

    } catch (error) {
      console.error('Camera sharing error: ', error);
      Alert.alert('Error', 'Failed to start camera sharing.');
    }
  };

  const handleStartButtonPress = () => {
    startCameraShare();
  };

  const handleStopButtonPress = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  };

  const handleSignaling = (pc, data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'answer') {
        console.log('Received answer:', message);
        pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: message.sdp }));
      } else if (message.type === 'candidate') {
        console.log('Received ICE candidate:', message.candidate);
        const candidate = new RTCIceCandidate(message.candidate);
        pc.addIceCandidate(candidate).catch(error => console.error('Error adding ICE candidate:', error));
      }
    } catch (error) {
      console.error('Error handling signaling data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={stream ? 'Stop Sharing' : 'Start Sharing'}
        onPress={stream ? handleStopButtonPress : handleStartButtonPress}
      />
      {stream && <RTCView streamURL={stream.toURL()} style={styles.stream} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stream: {
    width: '100%',
    height: '100%',
  },
});




