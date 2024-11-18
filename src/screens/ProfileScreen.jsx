import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../config/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const user = auth.currentUser;
  const navigation = useNavigation();

  // Carregar dados do Firestore ao montar o componente
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'usuarios', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setDisplayName(userData.nome || '');
        setEmail(userData.email || '');
        setPhotoURL(userData.profileImageUrl || '');
      }
    });

    return unsubscribe; // Limpa o listener ao sair da tela
  }, []);

  // Atualizar perfil no Firestore
  const updateProfile = async () => {
    try {
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        await setDoc(
          userDocRef,
          {
            nome: displayName || userData.nome, // Atualizar nome ou manter existente
            email: user.email, // Garantir que o e-mail do Firebase seja usado
            profileImageUrl: photoURL || userData.profileImageUrl, // Atualizar foto ou manter existente
            autenticacao: userData.autenticacao, // Preservar campo autenticacao
          },
          { merge: true }
        );

        setShowSuccessModal(true); // Exibe o modal de sucesso
      } else {
        // Caso o documento ainda não exista, cria um novo
        await setDoc(userDocRef, {
          nome: displayName || user.displayName || 'Usuário',
          email: user.email,
          profileImageUrl: photoURL || user.photoURL || 'https://placekitten.com/200/200',
          autenticacao: user.providerData[0]?.providerId === 'password' ? 1 : 2, // Diferenciar provedores
        });

        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  // Selecionar e fazer upload de imagem para Firebase Storage
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
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storageRef = ref(getStorage(), `profileImages/${user.uid}`);
      const uploadTask = await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(uploadTask.ref);
      setPhotoURL(downloadURL); // Define a URL da imagem no estado
    }
  };

  // Excluir conta
  const deleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'usuarios', user.uid));
      await user.delete();
      navigation.replace('Splash');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
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

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigation.navigate('Profile');
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          style={styles.input}
          editable={false} // Impede edição direta do email
        />

        <TouchableOpacity onPress={updateProfile} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetPassword} style={styles.resetPasswordButton}>
          <Text style={styles.resetPasswordButtonText}>Redefinir Senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showConfirmDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir Conta</Text>
        </TouchableOpacity>

        {/* Modal de Sucesso */}
        <Modal transparent={true} visible={showSuccessModal} animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Perfil atualizado com sucesso!</Text>
              <TouchableOpacity onPress={closeSuccessModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  container: {
    flex: 1,
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
  saveButton: {
    backgroundColor: '#8a0b07',
    padding: 12,
    borderRadius: 10, // Adicionando borderRadius ao botão de salvar
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetPasswordButton: {
    marginTop: 10, // Espaçamento entre os botões
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
    marginTop: 10, // Espaçamento entre os botões
    padding: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
