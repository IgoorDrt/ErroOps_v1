import React, { useState } from 'react'; 
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';  // Ícone de voltar
import { FontAwesome } from 'react-native-vector-icons'; // Ícone do Google
import { auth } from '../config/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import { launchImageLibrary } from 'react-native-image-picker'; // Biblioteca para escolher imagem

const db = getFirestore();
const storage = getStorage();

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null); // Para armazenar a imagem do perfil
  const [imageUri, setImageUri] = useState(''); // Armazenar URI da imagem

  // Função para selecionar imagem da galeria
  const selectProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error && response.assets) {
        const selectedImage = response.assets[0];
        setProfileImage(selectedImage);
        setImageUri(selectedImage.uri); // Atualizar URI da imagem
      }
    });
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      let profileImageUrl = null;
  
      // Se o usuário selecionou uma imagem, faça o upload para o Firebase Storage
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        const img = await fetch(profileImage.uri);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        profileImageUrl = await getDownloadURL(imageRef); // Obter o URL da imagem
      }
  
      // Armazenar os dados do usuário no Firestore com o campo autenticacao = 1
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: name,
        email: user.email,
        uid: user.uid,
        profileImageUrl: profileImageUrl, // URL da imagem de perfil
        autenticacao: 1, // Adicionando o campo autenticacao com valor 1
      });
  
      navigation.navigate('Login'); // Redireciona para a página de login após o registro
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log('Usuário logado com Google:', user);
  
        // Pegar a foto de perfil do Google
        const googleProfileImageUrl = user.photoURL;
  
        // Armazenar os dados do usuário no Firestore com o campo autenticacao = 1
        await setDoc(doc(db, 'usuarios', user.uid), {
          nome: user.displayName || 'Usuário Google',
          email: user.email,
          uid: user.uid,
          profileImageUrl: googleProfileImageUrl, // URL da imagem de perfil do Google
          autenticacao: 1, // Adicionando o campo autenticacao com valor 1
        });
  
        navigation.navigate('Main'); // Redireciona para a página principal após login com Google
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Registrar-se</Text>
      {/* Exibir imagem de perfil, se houver */}
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.profileImage} /> : null}

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Botão para selecionar imagem */}
      <TouchableOpacity style={styles.imagePickerButton} onPress={selectProfileImage}>
        <Text style={styles.buttonText}>Escolher Foto de Perfil</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <FontAwesome name="google" size={24} color="#8a0b07" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    paddingTop: 110, // Aumentando o padding no topo
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#8a0b07',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Ajuste para garantir que fique no topo
    left: 20,
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#8a0b07',
    borderWidth: 2,
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#8a0b07',
    textAlign: 'center',
  },
});
