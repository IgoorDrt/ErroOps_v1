import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, Pressable, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

const CommunityScreen = ({ navigation }) => {
  const [errors, setErrors] = useState([]);
  const [comments, setComments] = useState({});
  const [userEmail, setUserEmail] = useState(null);
  const [userProfileImageUrl, setUserProfileImageUrl] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [postText, setPostText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      const userDocRef = doc(db, 'usuarios', user.uid); // Supondo que você tenha uma coleção 'usuarios'
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserProfileImageUrl(userData.profileImageUrl || null); // Atribui a URL da imagem de perfil
        }
      });

      const unsubscribeErrors = onSnapshot(collection(db, 'errors'), (snapshot) => {
        const errorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setErrors(errorsData);
      });
      
      return () => {
        unsubscribe();
        unsubscribeErrors();
      };
    }
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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
          setIsUploading(true);
          const imageUrl = imageUri ? await uploadImage(imageUri) : null;
          await addDoc(collection(db, 'errors'), {
            email: user.email,
            text: postText,
            imageUrl: imageUrl,
            profileImageUrl: userProfileImageUrl,
            comments: [],
            likes: [],
          });
          setPostText('');
          setImageUri(null);
          setShowSuccessModal(true);
        } catch (error) {
          console.error("Erro ao postar: ", error);
        } finally {
          setIsUploading(false);
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

  const renderError = ({ item }) => {
    const userLiked = item.likes?.includes(userEmail);

    return (
      <View style={styles.errorBox}>
        <View style={styles.userHeader}>
          <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
          <Text style={styles.username}>{item.email || 'Usuário desconhecido'}</Text>
        </View>

        {item.imageUrl && (
          <TouchableOpacity onPress={() => setSelectedPostImage(item.imageUrl)}>
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
          {/* Ícone de comentários */}
          <TouchableOpacity onPress={() => navigation.navigate('CommunityCommentScreen', { errorId: item.id })}>
            <MaterialIcons name="comment" size={24} color="#8a0b07" />
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
      {/* Modal de Sucesso */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successText}>Postagem realizada com sucesso!</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack(); // Navega de volta ao fechar o modal
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder="Descreva o erro aqui..."
        value={postText}
        onChangeText={setPostText}
        style={styles.input}
      />
      <TouchableOpacity style={styles.chooseImageButton} onPress={pickImage}>
        <Text style={styles.chooseImageButtonText}>Escolher Imagem</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      <TouchableOpacity style={styles.button} onPress={postError} disabled={isUploading}>
        <Text style={styles.buttonText}>{isUploading ? 'Postando...' : 'Postar Erro'}</Text>
      </TouchableOpacity>

      <FlatList
        data={errors}
        renderItem={renderError}
        keyExtractor={(item) => item.id}
        style={styles.errorList}
      />

      {selectedPostImage && (
        <Modal
          transparent={true}
          visible={!!selectedPostImage}
          onRequestClose={() => setSelectedPostImage(null)}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={100} style={styles.blurBackground}>
              <Pressable onPress={() => setSelectedPostImage(null)} style={styles.closeButton}>
                <Text style={styles.closeText}>Fechar</Text>
              </Pressable>
              <Image source={{ uri: selectedPostImage }} style={styles.fullscreenImage} resizeMode="contain" />
            </BlurView>
          </View>
        </Modal>
      )}

      {/* Botão para navegar para a SearchChatScreen */}
      <TouchableOpacity 
        style={styles.chatButton} 
        onPress={() => navigation.navigate('SearchChatScreen')}
      >
        <MaterialIcons name="chat" size={30} color="#fff" />
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
  chooseImageButton: {
    backgroundColor: '#8a0b07',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  chooseImageButtonText: {
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
    marginBottom: 10,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successBox: {
    width: 250,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    fontSize: 18,
    color: '#8a0b07',
    marginBottom: 15,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8a0b07',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommunityScreen;
