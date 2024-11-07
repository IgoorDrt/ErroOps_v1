import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

const db = getFirestore();
const auth = getAuth();

const MyPostsScreen = ({ navigation }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      
      const unsubscribe = onSnapshot(collection(db, 'errors'), (snapshot) => {
        const posts = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => post.email === user.email);
        setMyPosts(posts);
      });
      
      return () => unsubscribe();
    }
  }, []);

  const deletePost = async (postId) => {
    Alert.alert(
      "Confirmação",
      "Deseja realmente excluir este post?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'errors', postId));
            } catch (error) {
              console.error("Erro ao excluir o post: ", error);
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postBox}>
        <View style={styles.userHeader}>
          <Text style={styles.username}>{item.email || 'Usuário desconhecido'}</Text>
        </View>

        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
        <Text style={styles.postText}>{item.text || 'Post sem descrição'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => deletePost(item.id)} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color="#8a0b07" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CommunityCommentScreen', { errorId: item.id })}>
            <MaterialIcons name="comment" size={24} color="#8a0b07" />
            <Text style={styles.commentCount}>{item.comments.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={myPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.postList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  postList: {
    marginTop: 20,
  },
  postBox: {
    backgroundColor: '#f7f7f7',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontWeight: 'bold',
    color: '#8a0b07',
  },
  postText: {
    color: '#333',
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    marginRight: 15,
  },
  commentCount: {
    color: '#333',
    marginLeft: 5,
  },
});

export default MyPostsScreen;
