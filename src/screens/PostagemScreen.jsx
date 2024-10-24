import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// Firebase config (configure this according to your project)
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const PostagemScreen = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],  // You can adjust the aspect ratio as needed
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Set the image URI to the selected image
    }
  };

  // Function to upload image and post details
  const handlePost = async () => {
    if (!caption.trim()) {
      alert('Por favor, escreva uma legenda.');
      return;
    }

    try {
      setIsUploading(true);
      const user = auth.currentUser;
      let imageUrl = null;

      // Upload image if one is selected
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);
        
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Add post data to Firestore
      await addDoc(collection(db, 'posts'), {
        caption: caption,
        imageUrl: imageUrl, // Will be null if no image is selected
        email: user.email,
        likes: [],
        comments: [],
      });

      setIsUploading(false);
      alert('Postagem realizada com sucesso!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Erro ao fazer postagem: ', error);
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nova Postagem</Text>

      {/* Image Picker and Display */}
      {selectedImage ? (
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.selectedImage}
            resizeMode="contain"  // Ensures the image fits without being cropped
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.imageText}>Toque para selecionar uma imagem</Text>
        </TouchableOpacity>
      )}

      {/* Caption Input */}
      <TextInput
        placeholder="Escreva uma legenda..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
      />

      {/* Post Button */}
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
  },
  selectedImage: {
    width: '100%',
    height: 200, // Adjust as needed
    maxHeight: 300,  // Ensure the image doesn't grow too large
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
});

export default PostagemScreen;
