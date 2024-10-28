import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ChatScreen = ({ route, navigation }) => {
  const { userId, otherUserId } = route.params;

  if (!userId || !otherUserId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Erro: IDs de usuário não estão disponíveis.</Text>
      </View>
    );
  }

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserData, setOtherUserData] = useState(null);

  useEffect(() => {
    const updateStatus = async (status) => {
      const userDocRef = doc(db, 'onlineStatus', userId);
      if (status === 'online') {
        await updateDoc(userDocRef, { status: 'online', lastSeen: serverTimestamp() }, { merge: true });
      } else {
        await updateDoc(userDocRef, { status: 'offline', lastSeen: serverTimestamp() }, { merge: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateStatus('online');
      } else {
        updateStatus('offline');
      }
    });

    return () => {
      updateStatus('offline');
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    const fetchOtherUserData = async () => {
      const otherUserDoc = await getDoc(doc(db, 'usuarios', otherUserId));
      const otherUserStatusDoc = await getDoc(doc(db, 'onlineStatus', otherUserId));
      
      if (otherUserDoc.exists()) {
        setOtherUserData({ ...otherUserDoc.data(), ...otherUserStatusDoc.data() });
      }
    };
    fetchOtherUserData();
  }, [otherUserId]);

  const calculateLastSeenText = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = lastSeen.toDate();
    const diffInMs = now - lastSeenDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutos atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours} horas atrás`;
    } else {
      return `${diffInDays} dias atrás`;
    }
  };

  useEffect(() => {
    const chatId = getChatId(userId, otherUserId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      markMessagesAsDelivered(msgs); // Marca como entregues
      markMessagesAsRead(msgs); // Marca como lidas se vistas
    });

    return () => unsubscribe();
  }, [userId, otherUserId]);

  const markMessagesAsDelivered = async (msgs) => {
    const chatId = getChatId(userId, otherUserId);
    msgs.forEach(async (msg) => {
      if (msg.senderId !== userId && msg.status === 'sent') { 
        const messageDocRef = doc(db, 'chats', chatId, 'messages', msg.id);
        await updateDoc(messageDocRef, { status: 'delivered' });
      }
    });
  };

  const markMessagesAsRead = async (msgs) => {
    const chatId = getChatId(userId, otherUserId);
    msgs.forEach(async (msg) => {
      if (msg.senderId !== userId && msg.status === 'delivered') { 
        const messageDocRef = doc(db, 'chats', chatId, 'messages', msg.id);
        await updateDoc(messageDocRef, { status: 'read' });
      }
    });
  };

  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await sendMessage(result.uri, 'image');
    }
  };

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await sendMessage(result.uri, 'image');
    }
  };

  const handleSelectDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/*',
    });

    if (result.type === 'success') {
      await sendMessage(result.uri, 'document');
    }
  };

  const sendMessage = async (content, type = 'text') => {
    if ((content || newMessage.trim()) && userId) {
      const chatId = getChatId(userId, otherUserId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      try {
        await addDoc(messagesRef, {
          text: type === 'text' ? newMessage : '',
          imageUrl: type === 'image' ? content : '',
          documentUrl: type === 'document' ? content : '',
          senderId: userId,
          timestamp: serverTimestamp(),
          status: 'sent',
          type,
        });
        setNewMessage('');
      } catch (error) {
        console.error("Erro ao enviar a mensagem: ", error);
      }
    }
  };

  const getChatId = (user1, user2) => {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  };

  const renderMessageStatus = (status) => {
    if (status === 'sent') {
      return <Ionicons name="checkmark" size={16} color="#ccc" />;
    } else if (status === 'delivered') {
      return <Ionicons name="checkmark-done" size={16} color="#ccc" />;
    } else if (status === 'read') {
      return <Ionicons name="checkmark-done" size={16} color="#007AFF" />; // Flechas azuis
    }
    return null;
  };

  const renderMessage = ({ item }) => {
    const isSender = item.senderId === userId;
    return (
      <View style={[styles.messageContainer, isSender ? styles.sender : styles.receiver]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isSender && renderMessageStatus(item.status)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8a0b07" />
        </TouchableOpacity>
        {otherUserData && (
          <View style={styles.userInfo}>
            <Image
              source={{ uri: otherUserData.profileImageUrl || 'https://placekitten.com/200/200' }}
              style={styles.profileImage}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{otherUserData.nome || 'Usuário'}</Text>
              <Text style={styles.lastLogin}>
                {otherUserData.status === 'online'
                  ? 'Online'
                  : otherUserData.lastSeen
                    ? `Última vez online: ${calculateLastSeenText(otherUserData.lastSeen)}`
                    : 'Última vez online: Desconhecido'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleSelectDocument} style={styles.iconButton}>
          <Ionicons name="attach" size={24} color="#8a0b07" />
        </TouchableOpacity>
        <TextInput
          placeholder="Digite uma mensagem"
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleTakePhoto} style={styles.iconButton}>
          <Ionicons name="camera" size={24} color="#8a0b07" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => sendMessage(newMessage, 'text')} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>ENVIAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a0b07',
  },
  lastLogin: {
    fontSize: 14,
    color: '#999',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 10,
  },
  sender: {
    alignSelf: 'flex-end',
    backgroundColor: '#8a0b07',
  },
  receiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#0a0a0a',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  iconButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatScreen;
