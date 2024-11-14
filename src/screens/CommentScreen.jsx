import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const CommentScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const auth = getAuth();

  useEffect(() => {
    // Função para buscar a imagem de perfil do usuário logado
    const fetchUserProfileImage = async (userId) => {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        setUserProfileImage(userDoc.data().profileImageUrl);
      }
    };

    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      fetchUserProfileImage(user.uid); // Usa o UID do usuário para buscar a imagem
    }

    // Carrega os comentários em tempo real
    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (doc) => {
      if (doc.exists()) {
        setComments(doc.data().comments || []);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const postComment = async () => {
    if (commentText.trim()) {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          comments: [
            ...comments,
            {
              email: userEmail,
              profileImageUrl: userProfileImage, // Salva a URL da imagem de perfil do usuário logado
              commentText,
              timestamp: new Date().toISOString(),
              likes: 0,
              likedBy: []
            }
          ],
        });
        setCommentText('');
      } catch (error) {
        console.error("Erro ao postar comentário: ", error);
      }
    }
  };

  const likeComment = async (commentId) => {
    const comment = comments[commentId];
    const likedBy = comment.likedBy || [];
    const newLikedBy = likedBy.includes(userEmail)
      ? likedBy.filter(email => email !== userEmail)
      : [...likedBy, userEmail];

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: comments.map((c, idx) => {
          if (idx === commentId) {
            return {
              ...c,
              likes: newLikedBy.length,
              likedBy: newLikedBy,
            };
          }
          return c;
        }),
      });
      setLikedComments({
        ...likedComments,
        [commentId]: !likedComments[commentId],
      });
    } catch (error) {
      console.error("Erro ao dar like no comentário: ", error);
    }
  };

  const renderComment = ({ item, index }) => (
    <View style={styles.commentBox}>
      <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
      <View style={styles.commentContent}>
        <Text style={styles.commentEmail}>{item.email}</Text>
        <Text style={styles.commentTime}>{moment(item.timestamp).fromNow()}</Text>
        <Text style={styles.commentText}>{item.commentText}</Text>
        <View style={styles.reactionContainer}>
          <TouchableOpacity onPress={() => likeComment(index)} style={styles.likeButton}>
            <Icon
              name={likedComments[index] ? 'favorite' : 'favorite-border'}
              size={24}
              color={likedComments[index] ? '#8a0b07' : '#888'}
            />
            <Text style={styles.likeText}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>
      <Text style={styles.title}>Comentários</Text>
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
    backgroundColor: '#fff', // Fundo branco
    padding: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8a0b07',
  },
  postOwnerEmail: {
    fontSize: 14,
    color: '#8a0b07',
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
    backgroundColor: '#f0f0f0', // Fundo cinza-claro para destacar o comentário
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
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#888',
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

export default CommentScreen;
