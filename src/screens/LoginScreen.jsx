import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FontAwesome } from 'react-native-vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore

const db = getFirestore();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obter o documento do Firestore do usuário logado
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verificar o campo autenticacao e navegar para a tela correta
        if (userData.autenticacao === 1 || userData.autenticacao === 2) {
          navigation.navigate('Main'); // Tela principal (tanto para usuários quanto empresas)
        } else if (userData.autenticacao === 3) {
          navigation.navigate('PainelAdm'); // Tela de admin
        } else {
          setError('Permissão inválida.');
        }
      } else {
        setError('Dados do usuário não encontrados.');
      }
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password') {
        setError('Senha incorreta. Tente novamente.');
      } else if (errorCode === 'auth/user-not-found') {
        setError('Usuário não encontrado.');
      } else {
        setError('Erro desconhecido.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Obter o documento do Firestore do usuário logado
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verificar o campo autenticacao e navegar para a tela correta
        if (userData.autenticacao === 1 || userData.autenticacao === 2) {
          navigation.navigate('Main'); // Tela principal (tanto para usuários quanto empresas)
        } else if (userData.autenticacao === 3) {
          navigation.navigate('PainelAdmScreen'); // Tela de admin
        } else {
          setError('Permissão inválida.');
        }
      } else {
        setError('Dados do usuário não encontrados.');
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
      <Text style={styles.title}>Entrar na sua conta</Text>
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
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Ou entre com</Text>
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
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#888',
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
});