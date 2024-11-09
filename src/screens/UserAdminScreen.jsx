import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const UserAdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    autenticacao: '',
    email: '',
    nome: '',
    profileImageUrl: '',
    uid: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (newUser.autenticacao && newUser.email && newUser.nome && newUser.profileImageUrl && newUser.uid) {
      await addDoc(collection(db, 'usuarios'), newUser);
      setNewUser({ autenticacao: '', email: '', nome: '', profileImageUrl: '', uid: '' });
    }
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      const userRef = doc(db, 'usuarios', selectedUser.id);
      await updateDoc(userRef, newUser);
      setSelectedUser(null);
      setNewUser({ autenticacao: '', email: '', nome: '', profileImageUrl: '', uid: '' });
    }
  };

  const handleDeleteUser = async (id) => {
    await deleteDoc(doc(db, 'usuarios', id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <Text style={styles.title}>Gerenciamento de Usuários</Text>

      <TextInput
        style={styles.input}
        placeholder="Autenticação"
        placeholderTextColor="#000"
        value={newUser.autenticacao}
        onChangeText={(text) => setNewUser({ ...newUser, autenticacao: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#000"
        value={newUser.email}
        onChangeText={(text) => setNewUser({ ...newUser, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#000"
        value={newUser.nome}
        onChangeText={(text) => setNewUser({ ...newUser, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Image URL"
        placeholderTextColor="#000"
        value={newUser.profileImageUrl}
        onChangeText={(text) => setNewUser({ ...newUser, profileImageUrl: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="UID"
        placeholderTextColor="#000"
        value={newUser.uid}
        onChangeText={(text) => setNewUser({ ...newUser, uid: text })}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={selectedUser ? handleUpdateUser : handleAddUser}
      >
        <Text style={styles.buttonText}>{selectedUser ? "Atualizar Usuário" : "Adicionar Usuário"}</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={user => user.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>Nome: {item.nome}</Text>
            <Text style={styles.userText}>Email: {item.email}</Text>
            <Text style={styles.userText}>Autenticação: {item.autenticacao}</Text>
            <Text style={styles.userText}>Profile Image URL: {item.profileImageUrl}</Text>
            <Text style={styles.userText}>UID: {item.uid}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => { setNewUser(item); setSelectedUser(item); }}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}
            >
              <Text style={styles.buttonText}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor:
      '#fff'
  },
  backButton: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold', 
    color: '#8a0b07', 
    textAlign: 'center', 
    marginBottom: 16,
  },
  input: {
    borderWidth: 1, 
    borderColor: '#8a0b07', 
    padding: 12, 
    marginBottom: 16, 
    borderRadius: 4, 
    color: '#000'
  },
  button: {
    backgroundColor: '#8a0b07', 
    padding: 12, borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16
  },
  buttonText: {
    color: '#fff', 
    fontWeight: 'bold'
  },
  userItem: {
    padding: 16, 
    marginVertical: 8, 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: '#8a0b07', 
    backgroundColor: '#f9f9f9'
  },
  userText: {
    color: '#000', 
    marginBottom: 4
  },
  editButton: {
    backgroundColor: '#8a0b07', 
    padding: 8, borderRadius: 4, 
    marginBottom: 4
  },
  deleteButton: {
    backgroundColor: '#8a0b07',
     padding: 8, borderRadius: 4
  }
});

export default UserAdminScreen;
