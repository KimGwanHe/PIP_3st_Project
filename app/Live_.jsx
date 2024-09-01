// import React, { useState, useEffect, useRef } from 'react';
// import { View, Image, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const MAX_IMAGE_STACK_SIZE = 20;  // 이미지 스택의 최대 크기

// const ImageReceiverScreen = () => {
//   const [imageStack, setImageStack] = useState([]);  // 이미지 스택을 상태로 관리합니다.
//   const [currentImageUri, setCurrentImageUri] = useState(null);  // 현재 표시할 이미지 URI
//   const ws = useRef(null);  // WebSocket 객체를 ref로 관리합니다.
//   const intervalRef = useRef(null);  // setInterval ID를 ref로 관리합니다.

//   useEffect(() => {
//     const fetchClientIdAndHost = async () => {
//       try {
//         const clientId = await AsyncStorage.getItem('nickname');
//         const host = await AsyncStorage.getItem('host');
//         console.log('ClientId:', clientId);
//         console.log('Host:', host);
//         if (clientId && host) {
//           const wsUrl = `ws://192.168.45.119:8000/ws/${host}/${clientId}`;
//           console.log('Connecting to WebSocket:', wsUrl);
//           ws.current = new WebSocket(wsUrl);

//           ws.current.onopen = () => {
//             console.log('WebSocket connected');
//           };

//           ws.current.onmessage = (event) => {
//             try {
//               const data = event.data;
//               const message_ = data.split(': ')[1]
//               const message = JSON.parse(message_);
//               console.log('Message received from WebSocket:', message);
//               if (message.type === "image") {
//                 const image = message.content;
//                 const image_ = image.replace("image='",'').replace("'",'')
//                 const newImageUri = `data:image/jpeg;base64,${image_}`;
//                 setImageStack(prevStack => {
//                   const updatedStack = [...prevStack, newImageUri];
//                   if (updatedStack.length > MAX_IMAGE_STACK_SIZE) {
//                     updatedStack.shift();  // 가장 오래된 이미지 제거
//                   }
//                   return updatedStack;
//                 });
//               } else if (message.type === "text") {
//                 console.log('Text message received:', message.content);
//               } else {
//                 console.warn('Unexpected message type:', message);
//               }
//             } catch (error) {
//               console.error("Failed to parse WebSocket message", error);
//             }
//           };

//           ws.current.onclose = () => {
//             console.log('WebSocket disconnected');
//           };

//           ws.current.onerror = (error) => {
//             console.error('WebSocket error:', error);
//           };

//         } else {
//           console.error('ClientId or Host is missing');
//         }
//       } catch (error) {
//         console.error('Failed to retrieve clientId or host from AsyncStorage', error);
//       }
//     };

//     fetchClientIdAndHost();

//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (imageStack.length > 0) {
//       // 이미지 스택이 비어 있지 않으면 첫 번째 이미지를 표시합니다.
//       setCurrentImageUri(imageStack[0]);
//       startImagePlayback();
//     }
//   }, [imageStack]);

//   const startImagePlayback = () => {
//     if (!intervalRef.current) {
//       intervalRef.current = setInterval(() => {
//         setImageStack(prevStack => {
//           if (prevStack.length > 0) {
//             const nextImageStack = [...prevStack.slice(1)];
//             if (nextImageStack.length > 0) {
//               setCurrentImageUri(nextImageStack[0]); // 다음 이미지로 업데이트
//             } else {
//               clearInterval(intervalRef.current);
//               intervalRef.current = null;
//             }
//             return nextImageStack;
//           }
//           return prevStack;
//         });
//       }, 200);  // 프레임 전환 속도 조절 (100ms 마다 이미지 변경)
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {currentImageUri ? (
//         <Image
//           style={styles.image}
//           source={{ uri: currentImageUri }}
//           resizeMode="contain"
//           onLoad={() => console.log('Image loaded successfully')}
//           onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
//         />
//       ) : (
//         <View style={styles.placeholder} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
//   placeholder: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'black',
//   },
// });

// export default ImageReceiverScreen;

import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LiveTopGuest from '../components/LiveTopGuest';
import MessageInput from '../components/Message';

const MAX_IMAGE_STACK_SIZE = 20;

const ImageReceiverScreen = () => {
  const [imageStack, setImageStack] = useState([]);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [nextImageUri, setNextImageUri] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clientId, setClientId] = useState('');
  const [host, setHost] = useState('');
  const ws = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchClientIdAndHost = async () => {
      try {
        const savedClientId = await AsyncStorage.getItem('nickname');
        const savedHost = await AsyncStorage.getItem('host');
        if (savedClientId && savedHost) {
          setClientId(savedClientId);
          setHost(savedHost);
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
    if (host && clientId) {
      const wsUrl = `ws://192.168.0.23:8000/ws/${host}/${clientId}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        console.log('Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === "text") {
            const formattedMessage = `${data.sender}: ${data.content}`;
            setMessages(prevMessages => [...prevMessages, formattedMessage]);
          } else if (data.type === "image") {
            const image = data.content;
            const newImageUri = `data:image/jpeg;base64,${image}`;
            setImageStack(prevStack => {
              const updatedStack = [...prevStack, newImageUri];
              if (updatedStack.length > MAX_IMAGE_STACK_SIZE) {
                updatedStack.shift();
              }
              return updatedStack;
            });
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message", error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [host, clientId]);

  useEffect(() => {
    if (imageStack && imageStack.length > 0) {
      if (!currentImageUri) {
        setCurrentImageUri(imageStack[0]);
        setImageStack(prevStack => (prevStack || []).slice(1));
      } else {
        setNextImageUri(imageStack[0]);
        setImageStack(prevStack => (prevStack || []).slice(1));
      }
    }
  }, [imageStack]);

  const handleImageLoad = () => {
    setCurrentImageUri(nextImageUri);
    setNextImageUri(null);
  };

  const onSendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageObject = { type: "text", content: message, sender: clientId };
      ws.current.send(JSON.stringify(messageObject));
      console.log('Sent message:', messageObject);
    } else {
      console.error('WebSocket is not open');
    }
  };

  return (
    <View style={styles.container}>
      <LiveTopGuest />

      {currentImageUri && (
        <Image
          style={styles.image}
          source={{ uri: currentImageUri }}
          resizeMode="contain"
        />
      )}
      {nextImageUri && (
        <Image
          style={[styles.image, styles.absolute]}
          source={{ uri: nextImageUri }}
          resizeMode="contain"
          onLoad={handleImageLoad}
          onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
        />
      )}
      
      <MessageInput messages={messages} onSendMessage={onSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  absolute: {
    position: 'absolute', // 절대 위치 설정으로 이미지 겹치기
  },
});

export default ImageReceiverScreen;

