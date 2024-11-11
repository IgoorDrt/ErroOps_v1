import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import moment from 'moment';
import 'moment/locale/pt-br'; // Para exibir o tempo em português

moment.locale('pt-br'); // Configura o moment para o idioma português

const CommentScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [postOwnerEmail, setPostOwnerEmail] = useState(''); // Estado para armazenar o email do autor do post
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      setUserProfileImage(user.photoURL);
    }

    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (doc) => {
      if (doc.exists()) {
        const fetchedComments = doc.data().comments || [];
        setComments(fetchedComments);

        // Atualiza likedComments com base no likedBy de cada comentário
        const newLikedComments = {};
        fetchedComments.forEach((comment, index) => {
          const likedBy = comment.likedBy || []; // Garantir que likedBy seja um array vazio se não existir
          newLikedComments[index] = likedBy.includes(userEmail);
        });
        setLikedComments(newLikedComments);

        // Armazena o email do autor do post
        const postOwner = doc.data().email; // Supondo que o email do autor do post esteja no campo 'email'
        setPostOwnerEmail(postOwner);
      }
    });

    return () => unsubscribe();
  }, [postId, userEmail]);

  const postComment = async () => {
    if (commentText.trim()) {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          comments: arrayUnion({
            email: userEmail,
            profileImageUrl: userProfileImage,
            commentText,
            timestamp: new Date().toISOString(), // Salva o timestamp
            likes: 0, // Inicializa o número de likes como 0
            likedBy: [] // Inicializa likedBy como um array vazio
          })
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
      const postRef = doc(db, 'posts', postId);

      // Atualiza os campos likes e likedBy diretamente
      await updateDoc(postRef, {
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
            {/* Garantir que item.likes seja sempre um número válido */}
            <Text style={styles.likeText}>{item.likes || 0}</Text>
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Comentários</Text>
        {/* Exibe o email do autor do post */}
        <Text style={styles.postOwnerEmail}>{postOwnerEmail}</Text>
      </View>

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
