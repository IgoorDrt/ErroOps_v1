import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { collection, query, getDocs, onSnapshot, orderBy, addDoc, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../config/firebase'; 
import Icon from 'react-native-vector-icons/Ionicons';

// Função para verificar ou criar chat
const findOrCreateChat = async (user1, user2) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', user1.email)
    );
    const querySnapshot = await getDocs(q);

    let chatId = null;
    querySnapshot.forEach((doc) => {
      const chatUsers = doc.data().users;
      if (Array.isArray(chatUsers) && chatUsers.includes(user2.email)) {
        chatId = doc.id;
      }
    });

    if (!chatId) {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        users: [user1.email, user2.email],
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSender: '',
        unreadCount: 0,
        lastReadTime: null,
      });
      chatId = newChatRef.id;
    }

    return chatId;
  } catch (error) {
    console.error('Erro ao verificar ou criar o chat:', error);
  }
};

// Função para enviar uma mensagem
const sendMessage = async (chatId, message, senderEmail) => {
  try {
    if (!senderEmail) {
      throw new Error('O email do remetente está indefinido');
    }

    if (!chatId || !message) {
      throw new Error('Campos obrigatórios não definidos');
    }

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: message,
      timestamp: Timestamp.now(),
      sender: senderEmail,
    });

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: message,
      lastMessageTime: Timestamp.now(),
      lastMessageSender: senderEmail,
    });

    console.log('Mensagem enviada e última mensagem atualizada no chat');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};

// Função para iniciar ou continuar um chat
const startChat = async (loggedUser, otherUser, navigation) => {
  try {
    if (!loggedUser || !loggedUser.email) {
      throw new Error('Usuário não autenticado ou email indefinido');
    }

    const chatId = await findOrCreateChat(loggedUser, otherUser);
    console.log("Chat ID encontrado ou criado:", chatId);

    if (chatId) {
      await sendMessage(chatId, "Olá! Este é o início da conversa.", loggedUser.email);
      navigation.navigate('ChatScreen', { userId: loggedUser.uid, otherUserId: otherUser.id });
    }
  } catch (error) {
    console.error('Erro ao iniciar ou continuar o chat:', error);
  }
};

const SearchChatScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [loggedUser, setLoggedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedUser(user);
      } else {
        navigation.navigate('LoginScreen');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loggedUser) {
      const fetchUsers = async () => {
        try {
          const q = query(collection(db, 'usuarios'));
          const querySnapshot = await getDocs(q);
          const userList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(userList);
        } catch (error) {
          console.log('Erro ao buscar usuários:', error);
        }
      };
      fetchUsers();
    }
  }, [loggedUser]);

  useEffect(() => {
    if (loggedUser) {
      const q = query(
        collection(db, 'chats'),
        orderBy('lastMessageTime', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatList = querySnapshot.docs
          .filter((doc) => {
            const chatUsers = doc.data().users || [];
            return Array.isArray(chatUsers) && loggedUser && loggedUser.email && chatUsers.indexOf(loggedUser.email) !== -1;
          })
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            unreadMessages: calculateUnreadMessages(doc),
          }));
        setChats(chatList);
        setIsLoading(false);
      });
      return unsubscribe;
    }
  }, [loggedUser]);

  const calculateUnreadMessages = (chat) => {
    if (chat.lastMessage && chat.lastMessageSender && chat.lastMessageSender !== loggedUser.email) {
      if (chat.lastMessageTime && chat.lastReadTime) {
        return chat.lastMessageTime.toDate() > chat.lastReadTime.toDate() ? chat.unreadCount || 1 : 0;
      }
      return chat.unreadCount || 1;
    }
    return 0;
  };

  const calculateLastMessageTimeText = (lastMessageTime) => {
    if (!lastMessageTime) return 'Desconhecida';

    const now = new Date();
    const messageTimeDate = lastMessageTime.toDate();
    const diffInMs = now - messageTimeDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `${messageTimeDate.getHours()}:${messageTimeDate.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${diffInDays} dias`;
    }
  };

  const renderChat = ({ item }) => {
    const otherUserEmail = item.users && loggedUser && Array.isArray(item.users) && item.users.find((email) => email !== loggedUser.email);
    
    if (!otherUserEmail) return null;

    const otherUser = otherUserEmail && users ? users.find((user) => user.email === otherUserEmail) : null;

    if (!otherUser) return null;

    return (
      <TouchableOpacity style={styles.conversationItem} onPress={() => startChat(loggedUser, otherUser, navigation)}>
        <Image
          source={otherUser.profileImageUrl ? { uri: otherUser.profileImageUrl } : require('../../assets/ErrOops.png')}
          style={styles.profileImage}
          placeholder="blur"
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.conversationText}>
          <Text style={styles.conversationName}>{otherUser.nome || 'Usuário Desconhecido'}</Text>
          <Text style={styles.lastMessage}>
            {item.lastMessage && item.lastMessage.trim() !== '' ? item.lastMessage : 'Sem mensagens'}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.messageTime}>
            {item.lastMessageTime ? calculateLastMessageTimeText(item.lastMessageTime) : 'Desconhecida'}
          </Text>
          {item.unreadMessages > 0 && (
            <View style={styles.unreadMessageBadge}>
              <Text style={styles.unreadMessageCount}>{item.unreadMessages}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserSuggestions = () => {
    const filteredUsers = users.filter((user) =>
      user.nome.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestionItem} onPress={() => startChat(loggedUser, item, navigation)}>
            <Text style={styles.suggestionText}>{item.nome} ({item.email})</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>Conversas</Text>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          placeholder="Procure por nome ou email"
          value={search}
          onChangeText={(text) => setSearch(text)}
          style={styles.searchInput}
        />
      </View>
      {search ? renderUserSuggestions() : null}

      {isLoading ? (
        <ActivityIndicator size="large" color="#8a0b07" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#8a0b07',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#8a0b07',
    borderRadius: 8,
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationText: {
    flex: 1,
  },
  conversationName: {
    color: '#8a0b07',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  messageTime: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  unreadMessageBadge: {
    backgroundColor: '#4caf50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadMessageCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  suggestionText: {
    color: '#8a0b07',
    fontSize: 16,
  },
});

export default SearchChatScreen;
