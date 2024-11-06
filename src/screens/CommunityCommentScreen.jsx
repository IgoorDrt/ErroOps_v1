import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase'; // Ajuste o caminho se necessário
import moment from 'moment';
import 'moment/locale/pt-br'; // Para exibir o tempo em português

moment.locale('pt-br');

const CommunityCommentScreen = ({ route, navigation }) => {
  const { errorId } = route.params; // Recebe o ID do erro da comunidade
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      setUserProfileImage(user.photoURL);
    }

    const unsubscribe = onSnapshot(doc(db, 'errors', errorId), (doc) => {
      if (doc.exists()) {
        setComments(doc.data().comments || []);
      }
    });

    return () => unsubscribe();
  }, [errorId]);

  const postComment = async () => {
    if (commentText.trim()) {
      try {
        const errorRef = doc(db, 'errors', errorId);
        await updateDoc(errorRef, {
          comments: arrayUnion({
            email: userEmail,
            profileImageUrl: userProfileImage,
            commentText,
            timestamp: new Date().toISOString(),
          }),
        });
        setCommentText('');
      } catch (error) {
        console.error("Erro ao postar comentário: ", error);
      }
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentBox}>
      <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
      <View style={styles.commentContent}>
        <Text style={styles.commentEmail}>{item.email}</Text>
        <Text style={styles.commentTime}>{moment(item.timestamp).fromNow()}</Text>
        <Text style={styles.commentText}>{item.commentText}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>
      <Text style={styles.title}>Comentários da Comunidade</Text>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item, index) => index.toString()}
        style={styles.commentList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adicione um comentário..."
          placeholderTextColor="#8a0b07"
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={postComment} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 10,
  },
  commentList: {
    flex: 1,
  },
  commentBox: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentEmail: {
    color: '#000',
    fontWeight: 'bold',
  },
  commentTime: {
    color: '#555',
    fontSize: 12,
  },
  commentText: {
    color: '#333',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    color: '#000',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CommunityCommentScreen;
