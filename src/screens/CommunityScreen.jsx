import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';  // Importing the icon library

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CommunityScreen = ({ navigation }) => {
  const [errorText, setErrorText] = useState('');
  const [errors, setErrors] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    // Recuperar os erros postados do Firebase
    const unsubscribe = onSnapshot(collection(db, 'errors'), (snapshot) => {
      const errorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setErrors(errorsData);
    });

    return () => unsubscribe();
  }, []);

  const postError = async () => {
    if (errorText.trim()) {
      const user = auth.currentUser; // Obtém o usuário autenticado
      if (user) {
        const email = user.email; // Pega o e-mail do usuário logado
        try {
          await addDoc(collection(db, 'errors'), {
            email, // Armazena o e-mail do usuário logado
            text: errorText,
            comments: [] // Inicia a lista de comentários vazia
          });
          setErrorText('');
        } catch (error) {
          console.error("Erro ao postar: ", error);
        }
      } else {
        console.error("Usuário não está logado.");
      }
    }
  };

  const postComment = async (errorId, commentText) => {
    if (commentText.trim()) {
      const user = auth.currentUser; // Obtém o usuário autenticado
      if (user) {
        const email = user.email; // Pega o e-mail do usuário logado
        try {
          const errorRef = doc(db, 'errors', errorId);
          await updateDoc(errorRef, {
            comments: arrayUnion({ email, commentText }) // Adiciona o novo comentário ao array de comentários
          });
          setComments((prev) => ({ ...prev, [errorId]: '' })); // Limpa o campo de input de comentários
        } catch (error) {
          console.error("Erro ao postar comentário: ", error);
        }
      } else {
        console.error("Usuário não está logado.");
      }
    }
  };

  const renderError = ({ item }) => {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.username}>{item.email}</Text> {/* Exibe o e-mail do usuário */} 
        <Text style={styles.errorText}>{item.text}</Text> {/* Exibe o texto do erro */}
        
        {/* Renderiza os comentários se existirem */}
        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentList}>
            {item.comments.map((comment, index) => (
              <Text key={index} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.email}:</Text> {comment.commentText}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.commentSection}>
          <TextInput
            placeholder="Comente aqui..."
            value={comments[item.id] || ''}
            onChangeText={(text) => setComments({ ...comments, [item.id]: text })}
            style={styles.commentInput}
          />
          <TouchableOpacity onPress={() => postComment(item.id, comments[item.id])}>
            <Text style={styles.commentButton}>Comentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Poste seu erro aqui..."
        value={errorText}
        onChangeText={setErrorText}
        style={styles.input}
      />
      <Button title="Postar Erro" onPress={postError} color="#8a0b07" borderRadius="5px "/>
      <FlatList
        data={errors}
        renderItem={renderError}
        keyExtractor={(item) => item.id}
        style={styles.errorList}
      />
      
      {/* Floating Button with Icon */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('SearchChatScreen')} // Navigate to SearchChatScreen
      >
        <Icon name="message" size={30} color="white" />  {/* Message Icon */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8a0b07',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  errorList: {
    marginTop: 20,
  },
  errorBox: {
    backgroundColor: '#8a0b07',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
  },
  username: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorText: {
    color: '#fff',
  },
  commentSection: {
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 5,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  commentButton: {
    color: '#fff',
    marginTop: 5,
  },
  commentList: {
    marginTop: 10,
  },
  comment: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  // Floating button styles
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000000', // Updated to the requested color
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default CommunityScreen;
