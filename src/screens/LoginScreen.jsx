import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Modal, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FontAwesome } from 'react-native-vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const db = getFirestore();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [noAccountModalVisible, setNoAccountModalVisible] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android: '694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com',
      ios: '694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com',
      web: '694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleGoogleLogin(credential);
    }
  }, [response]);

  const handleLogin = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.autenticacao === 1 || userData.autenticacao === 2) {
          navigation.navigate('Main');
        } else if (userData.autenticacao === 3) {
          navigation.navigate('PainelAdm');
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
        setNoAccountModalVisible(true); // Exibe o modal caso o usuário não seja encontrado
      } else {
        setError('Erro desconhecido.');
      }
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.autenticacao === 1 || userData.autenticacao === 2) {
          navigation.navigate('Main');
        } else if (userData.autenticacao === 3) {
          navigation.navigate('PainelAdm');
        } else {
          setError('Permissão inválida.');
        }
      } else {
        setError('Dados do usuário não encontrados.');
        setNoAccountModalVisible(true); // Exibe o modal caso o usuário Google não seja encontrado
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Icon name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#8a0b07" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Ou entre com</Text>
      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
        <FontAwesome name="google" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.noAccountButton} onPress={() => setNoAccountModalVisible(true)}>
        <Text style={styles.noAccountText}>Não tem uma conta? Clique aqui</Text>
      </TouchableOpacity>

      <Modal
        visible={noAccountModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNoAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Ainda não tem uma conta?</Text>
            <Text style={styles.modalText}>Registre-se agora para acessar o aplicativo!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setNoAccountModalVisible(false);
                navigation.navigate('Register');
              }}
            >
              <Text style={styles.modalButtonText}>Ir para Registro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setNoAccountModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
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
  noAccountButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  noAccountText: {
    color: '#8a0b07',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCloseButtonText: {
    color: '#8a0b07',
    fontSize: 16,
  },
});
