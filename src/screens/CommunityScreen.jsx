import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, Pressable, TextInput, Button } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

const CommunityScreen = ({ navigation }) => {
  const [errors, setErrors] = useState([]);
  const [comments, setComments] = useState({});
  const [userEmail, setUserEmail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [postText, setPostText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email);

    const unsubscribe = onSnapshot(collection(db, 'errors'), (snapshot) => {
      const errorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setErrors(errorsData);
    });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) return null;
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `images/${Date.now()}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const postError = async () => {
    if (postText.trim() || imageUri) {
      const user = auth.currentUser;
      if (user) {
        try {
          const imageUrl = imageUri ? await uploadImage(imageUri) : null;
          await addDoc(collection(db, 'errors'), {
            email: user.email,
            text: postText,
            imageUrl: imageUrl,
            comments: [],
            likes: [],
          });
          setPostText('');
          setImageUri(null);
        } catch (error) {
          console.error("Erro ao postar: ", error);
        }
      } else {
        console.error("Usuário não está logado.");
      }
    }
  };

  const likeError = async (errorId) => {
    const errorRef = doc(db, 'errors', errorId);
    const user = auth.currentUser;
    if (user) {
      try {
        const error = errors.find((err) => err.id === errorId);
        const userLiked = error.likes?.includes(user.email);

        await updateDoc(errorRef, {
          likes: userLiked ? arrayRemove(user.email) : arrayUnion(user.email),
        });
      } catch (error) {
        console.error("Erro ao curtir o erro: ", error);
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
            comments: arrayUnion({ email: user.email, commentText }),
          });
          setComments((prev) => ({ ...prev, [errorId]: '' }));
        } catch (error) {
          console.error("Erro ao postar comentário: ", error);
        }
      }
    }
  };

  const renderError = ({ item }) => {
    const userLiked = item.likes?.includes(userEmail);

    return (
      <View style={styles.errorBox}>
        <View style={styles.userHeader}>
          <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
          <Text style={styles.username}>{item.email || 'Usuário desconhecido'}</Text>
        </View>

        {item.imageUrl && (
          <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl)}>
            <Image source={{ uri: item.imageUrl }} style={styles.errorImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.errorText}>{item.text || 'Erro sem descrição'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => likeError(item.id)} style={styles.likeSection}>
            <MaterialIcons
              name="favorite"
              size={24}
              color={userLiked ? '#8a0b07' : '#888'}
              style={styles.likeIcon}
            />
            <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
        </View>

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
        placeholder="Descreva o erro aqui..."
        value={postText}
        onChangeText={setPostText}
        style={styles.input}
      />
      <Button title="Escolher Imagem" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <TouchableOpacity style={styles.button} onPress={postError}>
        <Text style={styles.buttonText}>Postar Erro</Text>
      </TouchableOpacity>
      
      <FlatList
        data={errors}
        renderItem={renderError}
        keyExtractor={(item) => item.id}
        style={styles.errorList}
      />

      {selectedImage && (
        <Modal
          transparent={true}
          visible={!!selectedImage}
          onRequestClose={() => setSelectedImage(null)}
        >
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
    marginBottom: 10,
    borderRadius: 5,
    color: '#333',
  },
  button: {
    backgroundColor: '#8a0b07',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  errorList: {
    marginTop: 20,
  },
  errorBox: {
    backgroundColor: '#f7f7f7',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
  errorText: {
    color: '#333',
    marginVertical: 10,
  },
  errorImage: {
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
  },
  likeIcon: {
    marginRight: 5,
  },
  likeCount: {
    color: '#333',
  },
  commentSection: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    flex: 1,
    marginRight: 10,
    borderRadius: 5,
    color: '#333',
  },
  commentButton: {
    color: '#8a0b07',
    fontWeight: 'bold',
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

export default CommunityScreen;
