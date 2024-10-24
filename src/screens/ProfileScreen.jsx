import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDisplayName(userData.nome || '');
        setEmail(userData.email || '');
        setPhotoURL(userData.profileImageUrl || '');
      }
    };

    fetchUserData();
  }, []);

  const updateProfile = async () => {
    try {
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: displayName,
        email,
        profileImageUrl: photoURL,
      });
      await user.updateProfile({
        displayName,
        photoURL,
      });

      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil: ', error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
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
      setPhotoURL(result.assets[0].uri);
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'usuarios', user.uid));
      await user.delete();
      navigation.replace('Splash');
    } catch (error) {
      console.error('Erro ao excluir conta: ', error);
      alert('Erro ao excluir a conta.');
    }
  };

  const showConfirmDelete = () => {
    setIsConfirmingDelete(true);
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
  };

  const resetPassword = () => {
    navigation.navigate('ResetPassword');
  };

  if (isConfirmingDelete) {
    return (
      <View style={styles.confirmContainer}>
        <Text style={styles.confirmHeading}>Tem certeza?</Text>
        <Text style={styles.confirmText}>Deseja realmente excluir sua conta? Esta ação não pode ser desfeita.</Text>
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity onPress={deleteAccount} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Sim, excluir conta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelDelete} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Editar Perfil</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: photoURL || 'https://placekitten.com/200/200' }} // Imagem padrão
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.imageText}>Toque para atualizar a foto</Text>

      <TextInput
        placeholder="Nome"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Button title="Salvar" onPress={updateProfile} color="#8a0b07" />

      <TouchableOpacity onPress={resetPassword} style={styles.resetPasswordButton}>
        <Text style={styles.resetPasswordButtonText}>Redefinir Senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={showConfirmDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Excluir Conta</Text>
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
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 10,
  },
  imageText: {
    textAlign: 'center',
    color: '#8a0b07',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  resetPasswordButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetPasswordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 'auto',
    padding: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  confirmHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
