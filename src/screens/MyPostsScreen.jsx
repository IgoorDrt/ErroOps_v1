import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, ScrollView } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const db = getFirestore();
const auth = getAuth();

const MyPostsScreen = ({ navigation }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedBy, setLikedBy] = useState([]);

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

  const openDeleteModal = (postId) => {
    setSelectedPostId(postId);
    setDeleteModalVisible(true);
  };

  const confirmDeletePost = async () => {
    if (selectedPostId) {
      try {
        await deleteDoc(doc(db, 'errors', selectedPostId));
        setDeleteModalVisible(false);
      } catch (error) {
        console.error("Erro ao excluir o post: ", error);
      }
    }
  };

  const openLikesModal = (likes) => {
    setLikedBy(likes || []); // Define um array vazio se `likes` for `undefined`
    setLikesModalVisible(true);
  };

  const renderPost = ({ item }) => {
    const likeCount = item.likes ? item.likes.length : 0; // Verifica a quantidade de likes no array `likes`
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
          <TouchableOpacity onPress={() => openLikesModal(item.likes)} style={styles.likeButton}>
            <FontAwesome name="heart" size={20} color="#8a0b07" />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CommunityCommentScreen', { errorId: item.id })} style={styles.commentButton}>
            <MaterialIcons name="comment" size={20} color="#8a0b07" />
            <Text style={styles.commentCount}>{item.comments ? item.comments.length : 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openDeleteModal(item.id)} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color="#8a0b07" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>
      <Text style={styles.title}>Meus Posts</Text>
      <Text style={styles.description}>Aqui são seus posts. Você pode vê-los e excluí-los.</Text>

      <FlatList
        data={myPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.postList}
      />

      {/* Modal para confirmação de exclusão */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Deseja realmente excluir este post?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDeletePost} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para visualizar curtidas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={likesModalVisible}
        onRequestClose={() => setLikesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.likesModalBox}>
            <TouchableOpacity onPress={() => setLikesModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8a0b07" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Curtidas</Text>
            <ScrollView style={styles.likesList}>
              {likedBy.length > 0 ? (
                likedBy.map((user, index) => (
                  <Text key={index} style={styles.likeUser}>{user}</Text>
                ))
              ) : (
                <Text style={styles.likeUser}>Ninguém curtiu ainda</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginTop: 50,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 5,
    color: '#333',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    marginLeft: 5,
    color: '#333',
  },
  deleteButton: {
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginRight: 10,
  },
  cancelText: {
    color: '#333',
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#8a0b07',
    borderRadius: 5,
  },
  confirmText: {
    color: '#fff',
  },
  likesModalBox: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8a0b07',
  },
  likesList: {
    width: '100%',
  },
  likeUser: {
    paddingVertical: 5,
    textAlign: 'center',
    color: '#333',
  },
});

export default MyPostsScreen;
