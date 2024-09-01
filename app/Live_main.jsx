// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text } from 'react-native';
// import { RTCView, RTCPeerConnection } from 'react-native-webrtc';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ScreenViewer = () => {
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const [ws, setWs] = useState(null);
//   const [clientId, setClientId] = useState(null);
//   const [host, setHost] = useState(null);

//   useEffect(() => {
//     const fetchClientIdAndHost = async () => {
//       try {
//         const clientId = await AsyncStorage.getItem('nickname');
//         const host = await AsyncStorage.getItem('host');
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
//     if (clientId && host && !ws) {
//       const wsUrl = `ws://192.168.161.6:8000/ws/${host}/${clientId}`;
//       const wsInstance = new WebSocket(wsUrl);

//       wsInstance.onopen = () => {
//         console.log('WebSocket connection opened');
//       };

//       wsInstance.onerror = (error) => {
//         console.error('WebSocket error:', error.message);
//       };

//       wsInstance.onclose = () => {
//         console.log('WebSocket connection closed');
//       };

//       wsInstance.onmessage = async (event) => {
//         if (peerConnection) {
//           const message = JSON.parse(event.data);
//           if (message.type === 'offer') {
//             await peerConnection.setRemoteDescription({ type: 'offer', sdp: message.sdp });
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             wsInstance.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
//           } else if (message.type === 'candidate') {
//             const candidate = new RTCIceCandidate(message.candidate);
//             await peerConnection.addIceCandidate(candidate);
//           }
//         }
//       };

//       setWs(wsInstance);
//     }
//   }, [clientId, host]);

//   useEffect(() => {
//     if (ws) {
//       const connection = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//       });

//       connection.ontrack = (event) => {
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };

//       setPeerConnection(connection);
//     }
//   }, [ws]);

//   return (
//     <View style={styles.container}>
//       {remoteStream ? (
//         <RTCView streamURL={remoteStream.toURL()} style={styles.stream} />
//       ) : (
//         <Text style={styles.waitingText}>Waiting for stream...</Text>
//       )}
//     </View>
//   );
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
//   waitingText: {
//     color: 'white',
//     fontSize: 20,
//   },
// });

// export default ScreenViewer;
// ======================================================
// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text } from 'react-native';
// import { RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ScreenViewer = () => {
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const [ws, setWs] = useState(null);
//   const [clientId, setClientId] = useState(null);
//   const [host, setHost] = useState(null);

//   useEffect(() => {
//     const fetchClientIdAndHost = async () => {
//       try {
//         const clientId = await AsyncStorage.getItem('nickname');
//         const host = await AsyncStorage.getItem('host');
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
//     if (clientId && host && !ws) {
//       const wsUrl = `ws://192.168.161.6:8000/ws/${host}/${clientId}`;
//       const wsInstance = new WebSocket(wsUrl);

//       wsInstance.onopen = () => {
//         console.log('WebSocket connection opened');
//       };

//       wsInstance.onerror = (error) => {
//         console.error('WebSocket error:', error.message);
//       };

//       wsInstance.onclose = () => {
//         console.log('WebSocket connection closed');
//       };

//       wsInstance.onmessage = async (event) => {
//         console.log('Received WebSocket message:', event.data);
//         if (peerConnection) {
//           try {
//             const message = JSON.parse(event.data);
//             if (message.type === 'offer') {
//               console.log('Received offer, setting remote description...');
//               await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
//               console.log('Creating answer...');
//               const answer = await peerConnection.createAnswer();
//               await peerConnection.setLocalDescription(answer);
//               console.log('Sending answer back to host...');
//               wsInstance.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
//             } else if (message.type === 'candidate') {
//               console.log('Received ICE candidate, adding...');
//               const candidate = new RTCIceCandidate(message.candidate);
//               await peerConnection.addIceCandidate(candidate);
//             }
//           } catch (err) {
//             console.error('Error handling signaling message:', err);
//           }
//         } else {
//           console.warn('PeerConnection is not initialized yet');
//         }
//       };

//       setWs(wsInstance);
//     }
//   }, [clientId, host, peerConnection]);

//   useEffect(() => {
//     if (!peerConnection && ws) {
//       const connection = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//       });
  
//       connection.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate:', event.candidate);
//           ws?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
//         }
//       };
  
//       connection.ontrack = (event) => {
//         console.log('Received remote track:', event.streams[0]); // 스트림이 제대로 수신되고 있는지 확인하는 로그
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };
  
//       setPeerConnection(connection);
//     }
//   }, [ws]);

//   return (
//     <View style={styles.container}>
//       {remoteStream ? (
//         <RTCView streamURL={remoteStream.toURL()} style={styles.stream} />
//       ) : (
//         <Text style={styles.waitingText}>Waiting for stream...</Text>
//       )}
//     </View>
//   );
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
//   waitingText: {
//     color: 'white',
//     fontSize: 20,
//   },
// });

// export default ScreenViewer;
// =================================================
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

export default function Guest() {
  const [remoteStream, setRemoteStream] = useState(null);
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
      const wsUrl = `ws://192.168.0.2:8000/ws/${host}/${clientId}`;
      const wsInstance = new WebSocket(wsUrl);
      setWs(wsInstance);
      
      wsInstance.onmessage = (event) => {
        handleSignalingMessage(peerConnection, event.data);
      };
      
      wsInstance.onerror = (error) => {
        console.error('WebSocket error: ', error.message);
      };
      
      wsInstance.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  }, [clientId, host, ws, peerConnection]);

  useEffect(() => {
    if (ws) {
      setupPeerConnection();
    }
  }, [ws]);

  const setupPeerConnection = () => {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    connection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    setPeerConnection(connection);
  };

  const handleSignalingMessage = async (pc, data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: message.sdp }));

        // Create an answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer back to the host
        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
      } else if (message.type === 'candidate') {
        const candidate = new RTCIceCandidate(message.candidate);
        await pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling signaling data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Text style={styles.buttonText}>Connect to Host</Text>
      </TouchableOpacity>
      {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={styles.stream} />}
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
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});