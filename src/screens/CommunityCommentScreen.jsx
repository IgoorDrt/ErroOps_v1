import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
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
  const [likedComments, setLikedComments] = useState({});
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
          comments: [
            ...comments, 
            {
              email: userEmail,
              profileImageUrl: userProfileImage,
              commentText,
              timestamp: new Date().toISOString(),
              likes: 0,  // Inicializa o número de likes como 0
              likedBy: []  // Inicializa likedBy como um array vazio
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
    
    // Verifica se o campo likedBy existe antes de acessá-lo
    const likedBy = comment.likedBy || []; // Se 'likedBy' for undefined, inicializa como um array vazio

    // Se o usuário já curtiu, remove o like, caso contrário, adiciona
    const newLikedBy = likedBy.includes(userEmail)
      ? likedBy.filter(email => email !== userEmail)  // Remove o like
      : [...likedBy, userEmail];  // Adiciona o like

    try {
      const errorRef = doc(db, 'errors', errorId);

      // Atualiza os campos likes e likedBy diretamente
      await updateDoc(errorRef, {
        comments: comments.map((c, idx) => {
          if (idx === commentId) {
            return {
              ...c,
              likes: newLikedBy.length,  // Atualiza a quantidade de likes
              likedBy: newLikedBy,  // Atualiza a lista de usuários que curtiram
            };
          }
          return c;  // Mantém os outros comentários inalterados
        }),
      });

      // Atualiza o estado de likedComments para refletir a mudança visual
      setLikedComments({
        ...likedComments,
        [commentId]: !likedComments[commentId],  // Alterna o estado de "curtido"
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
              color={likedComments[index] ? '#8a0b07' : '#888'} // Cor do coração
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
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  backButton: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8a0b07', // Cor padrão do site
    marginBottom: 15,
    textAlign: 'center',
  },
  commentList: {
    flex: 1,
    marginBottom: 15,
  },
  commentBox: {
    flexDirection: 'row',
    paddingVertical: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
  },
  commentContent: {
    flex: 1,
  },
  commentEmail: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentTime: {
    color: '#888',
    fontSize: 12,
    marginVertical: 5,
  },
  commentText: {
    color: '#444',
    fontSize: 14,
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
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginTop: 15,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#8a0b07', // Cor do botão de envio
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CommunityCommentScreen;
