import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

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
      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, 'errors'), {
            email: user.email || 'Usuário desconhecido', // Garante que email seja string
            text: errorText,
            comments: []
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
      const user = auth.currentUser;
      if (user) {
        try {
          const errorRef = doc(db, 'errors', errorId);
          await updateDoc(errorRef, {
            comments: arrayUnion({ email: user.email || 'Usuário desconhecido', commentText })
          });
          setComments((prev) => ({ ...prev, [errorId]: '' }));
        } catch (error) {
          console.error("Erro ao postar comentário: ", error);
        }
      } else {
        console.error("Usuário não está logado.");
      }
    }
  };

  const renderError = ({ item }) => (
    <View style={styles.errorBox}>
      <Text style={styles.username}>{item.email || 'Usuário desconhecido'}</Text>
      <Text style={styles.errorText}>{item.text || 'Erro sem descrição'}</Text>
      
      {item.comments && item.comments.length > 0 && (
        <View style={styles.commentList}>
          {item.comments.map((comment, index) => (
            <Text key={index} style={styles.comment}>
              <Text style={styles.commentUser}>{comment.email || 'Usuário desconhecido'}:</Text> {comment.commentText || 'Comentário sem texto'}
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

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Poste seu erro aqui..."
        value={errorText}
        onChangeText={setErrorText}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={postError}>
        <Text style={styles.buttonText}>Postar Erro</Text>
      </TouchableOpacity>
      
      <FlatList
        data={errors}
        renderItem={renderError}
        keyExtractor={(item) => item.id}
        style={styles.errorList}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('SearchChatScreen')}
      >
        <MaterialIcons name="message" size={30} color="white" />
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
    color: '#333',
  },
  button: {
    backgroundColor: '#8a0b07',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 5,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  commentButton: {
    color: '#fff',
    fontWeight: 'bold',
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default CommunityScreen;
