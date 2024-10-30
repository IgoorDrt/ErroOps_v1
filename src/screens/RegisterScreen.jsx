import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from 'react-native-vector-icons';
import { auth } from '../config/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import * as GoogleSignIn from 'expo-google-sign-in';

const db = getFirestore();
const storage = getStorage();

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    // Inicialize o Google Sign-In quando o componente for montado
    GoogleSignIn.initAsync();
  }, []);

  const selectProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error && response.assets) {
        const selectedImage = response.assets[0];
        setProfileImage(selectedImage);
        setImageUri(selectedImage.uri);
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

      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        const img = await fetch(profileImage.uri);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: name,
        email: user.email,
        uid: user.uid,
        profileImageUrl: profileImageUrl,
        autenticacao: 1,
      });

      navigation.navigate('Login');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await GoogleSignIn.signInAsync();

      if (result.type === 'success') {
        const { idToken } = result.user.auth;
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        await setDoc(doc(db, 'usuarios', user.uid), {
          nome: user.displayName || 'Usuário Google',
          email: user.email,
          uid: user.uid,
          profileImageUrl: user.photoURL,
          autenticacao: 1,
        });

        navigation.navigate('Main');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Registrar-se</Text>

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

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Icon name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#8a0b07" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
          <Icon name={isConfirmPasswordVisible ? "eye-off" : "eye"} size={24} color="#8a0b07" />
        </TouchableOpacity>
      </View>

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#8a0b07',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 0,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 0,
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
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
