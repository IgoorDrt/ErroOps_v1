import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, Pressable, StatusBar, ScrollView } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const EmpresaScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [userAuth, setUserAuth] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      const unsubscribe = onSnapshot(doc(db, 'usuarios', user.uid), (doc) => {
        if (doc.exists()) {
          setUserAuth(doc.data().autenticacao);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const likePost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const user = auth.currentUser;
    if (user) {
      try {
        const post = posts.find((p) => p.id === postId);
        const userLiked = post.likes?.includes(user.email);

        await updateDoc(postRef, {
          likes: userLiked ? arrayRemove(user.email) : arrayUnion(user.email),
        });
      } catch (error) {
        console.error("Erro ao curtir postagem: ", error);
      }
    }
  };

  const formatTimeSince = (timestamp) => {
    if (!timestamp) {
      return 'Data desconhecida';
    }

    const now = new Date();
    const postDate = timestamp.toDate();
    const diffInMs = now - postDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} s atrás`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours} h atrás`;
    } else {
      return `${diffInDays} d atrás`;
    }
  };

  const renderPost = ({ item }) => {
    const userLiked = item.likes?.includes(userEmail);

    return (
      <View style={styles.postBox}>
        <View style={styles.userHeader}>
          <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
          <Text style={styles.username}>
            {item.email || 'Usuário desconhecido'} - {formatTimeSince(item.timestamp)}
          </Text>
        </View>

        {item.imageUrl && (
          <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl)}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
          </TouchableOpacity>
        )}
        <Text style={styles.postText}>{item.caption || 'Sem legenda'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => likePost(item.id)} style={styles.likeSection}>
            <MaterialIcons
              name="favorite"
              size={24}
              color={userLiked ? '#8a0b07' : '#888'}
              style={styles.likeIcon}
            />
            <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CommentScreen', { postId: item.id })} style={styles.commentSection}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#8a0b07" />
            <Text style={styles.commentCount}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.container}>
        <Text style={styles.title}>Postagens da Empresa</Text>
        <Text style={styles.subtitle}>Veja e curta postagens recentes da nossa empresa.</Text>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          style={styles.postList}
        />

        {selectedImage && (
          <Modal transparent={true} visible={!!selectedImage} onRequestClose={() => setSelectedImage(null)}>
            <View style={styles.modalContainer}>
              <BlurView intensity={100} style={styles.blurBackground}>
                <Pressable onPress={() => setSelectedImage(null)} style={styles.closeButton}>
                  <Text style={styles.closeText}>Fechar</Text>
                </Pressable>
                <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
              </BlurView>
            </View>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  postBox: {
    backgroundColor: '#f4f4f4',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  likeIcon: {
    marginRight: 5,
  },
  likeCount: {
    color: '#333',
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    color: '#333',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  closeText: {
    color: '#8a0b07',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmpresaScreen;
