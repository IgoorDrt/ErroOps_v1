import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import Icon from 'react-native-vector-icons/Ionicons';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const PostagemScreen = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!caption.trim()) {
      alert('Por favor, escreva uma legenda.');
      return;
    }
    try {
      setIsUploading(true);
      const user = auth.currentUser;
      let imageUrl = null;

      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        caption: caption,
        imageUrl: imageUrl,
        email: user.email,
        likes: [],
        comments: [],
      });

      setIsUploading(false);
      setShowSuccessModal(true); // Mostra o modal de sucesso
    } catch (error) {
      console.error('Erro ao fazer postagem: ', error);
      setIsUploading(false);
    }
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

      {/* Seta de navegação */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
  <Icon name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>

      <Text style={styles.heading}>Nova Postagem</Text>

      {selectedImage ? (
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.selectedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.imageText}>Toque para selecionar uma imagem</Text>
        </TouchableOpacity>
      )}

      <TextInput
        placeholder="Escreva uma legenda..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
      />

      <TouchableOpacity onPress={handlePost} style={styles.postButton} disabled={isUploading}>
        <Text style={styles.postButtonText}>{isUploading ? 'Postando...' : 'Postar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 20,
    paddingTop: 60,
    textAlign: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  imageText: {
    textAlign: 'center',
    color: '#8a0b07',
    marginBottom: 20,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  postButton: {
    padding: 15,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
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
});

export default PostagemScreen;
