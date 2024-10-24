import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../config/firebase';
import { updatePassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // Importa o ícone

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigation = useNavigation();

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      setSuccessMessage(''); // Limpar a mensagem de sucesso
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      setSuccessMessage('Senha alterada com sucesso!');
      setErrorMessage(''); // Limpar a mensagem de erro

      // Redirecionar de volta para a página de perfil após um curto intervalo
      setTimeout(() => {
        navigation.navigate('Profile');
      }, 2000);
    } catch (error) {
      setErrorMessage('Erro ao alterar a senha. Tente novamente.');
      setSuccessMessage('');
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigation.navigate('Profile'); // Redireciona para a página de perfil sem alterar a senha
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <Text style={styles.heading}>Redefinir Senha</Text>

      <TextInput
        placeholder="Nova Senha"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirmar Nova Senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <TouchableOpacity onPress={handlePasswordReset} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Redefinir Senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  backButton: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#8a0b07',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ResetPassword;
