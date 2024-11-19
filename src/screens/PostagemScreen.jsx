import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, addDoc, collection, Timestamp, doc, getDoc } from 'firebase/firestore';
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
  
      // Obtém a imagem de perfil do usuário logado da coleção 'usuarios'
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userDocRef);
      const profileImageUrl = userDoc.exists() ? userDoc.data().profileImageUrl : null;
  
      if (!profileImageUrl) {
        alert('Imagem de perfil não encontrada.');
        setIsUploading(false);
        return;
      }
  
      let imageUrl = null;
  
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      // Adiciona o documento à coleção 'posts' com a URL da imagem de perfil e timestamp
      await addDoc(collection(db, 'posts'), {
        caption: caption,
        imageUrl: imageUrl,
        email: user.email,
        likes: [],
        comments: [],
        profileImageUrl: profileImageUrl, // Adiciona a URL da imagem de perfil do usuário
        timestamp: Timestamp.now(), // Adiciona o timestamp da postagem
      });
  
      setIsUploading(false);
      setShowSuccessModal(true); // Mostra o modal de sucesso
    } catch (error) {
      console.error('Erro ao fazer postagem: ', error);
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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

      {/* Cabeçalho com flecha para voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Criar publicação</Text>

      {/* Espaçamento adicional para conteúdo começar mais abaixo */}
      <View style={styles.contentWrapper}>
        {/* Input de Texto */}
        <TextInput
          placeholder="Escreva algo..."
          value={caption}
          onChangeText={setCaption}
          style={styles.captionInput}
          multiline
        />

        {/* Selecione uma imagem */}
        {selectedImage ? (
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Icon name="image" size={40} color="#8a0b07" />
            <Text style={styles.imageText}>Toque para adicionar uma imagem</Text>
          </TouchableOpacity>
        )}

        {/* Botão de Publicar */}
        <TouchableOpacity onPress={handlePost} style={[styles.postButton, isUploading && styles.disabledButton]} disabled={isUploading}>
          <Text style={styles.postButtonText}>{isUploading ? 'Postando...' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentWrapper: {
    marginTop: 60, // Aumentei o espaçamento para garantir que o conteúdo comece bem abaixo da flecha
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8a0b07',
  },
  imageText: {
    textAlign: 'center',
    color: '#8a0b07',
    fontSize: 18,
    marginTop: 10,
  },
  postButton: {
    padding: 15,
    backgroundColor: '#8a0b07',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 50,
    zIndex: 1, // Garante que o botão da flecha fique acima de outros elementos
  },
});

export default PostagemScreen;