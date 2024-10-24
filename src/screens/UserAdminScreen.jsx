// screens/UserAdminScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const UserAdminScreen = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    autenticacao: '',
    email: '',
    nome: '',
    profileImageUrl: '',
    uid: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);

  // Buscar os dados da coleção "usuarios" do Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  // Adicionar novo usuário à coleção "usuarios"
  const handleAddUser = async () => {
    if (newUser.autenticacao && newUser.email && newUser.nome && newUser.profileImageUrl && newUser.uid) {
      await addDoc(collection(db, 'usuarios'), newUser);
      setNewUser({ autenticacao: '', email: '', nome: '', profileImageUrl: '', uid: '' });
    }
  };

  // Atualizar um usuário existente na coleção "usuarios"
  const handleUpdateUser = async () => {
    if (selectedUser) {
      const userRef = doc(db, 'usuarios', selectedUser.id);
      await updateDoc(userRef, newUser);
      setSelectedUser(null);
      setNewUser({ autenticacao: '', email: '', nome: '', profileImageUrl: '', uid: '' });
    }
  };

  // Deletar um usuário da coleção "usuarios"
  const handleDeleteUser = async (id) => {
    await deleteDoc(doc(db, 'usuarios', id));
  };

  return (
    <View style={styles.container}>
      <Text>Gerenciamento de Usuários</Text>

      {/* Inputs para os campos do usuário */}
      <TextInput
        style={styles.input}
        placeholder="Autenticação"
        value={newUser.autenticacao}
        onChangeText={(text) => setNewUser({ ...newUser, autenticacao: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={newUser.email}
        onChangeText={(text) => setNewUser({ ...newUser, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={newUser.nome}
        onChangeText={(text) => setNewUser({ ...newUser, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Image URL"
        value={newUser.profileImageUrl}
        onChangeText={(text) => setNewUser({ ...newUser, profileImageUrl: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="UID"
        value={newUser.uid}
        onChangeText={(text) => setNewUser({ ...newUser, uid: text })}
      />

      {/* Botão para adicionar ou atualizar */}
      <Button
        title={selectedUser ? "Atualizar Usuário" : "Adicionar Usuário"}
        onPress={selectedUser ? handleUpdateUser : handleAddUser}
      />

      {/* Lista de usuários */}
      <FlatList
        data={users}
        keyExtractor={user => user.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>Nome: {item.nome}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Autenticação: {item.autenticacao}</Text>
            <Text>Profile Image URL: {item.profileImageUrl}</Text>
            <Text>UID: {item.uid}</Text>
            <Button title="Editar" onPress={() => { setNewUser(item); setSelectedUser(item); }} />
            <Button title="Deletar" onPress={() => handleDeleteUser(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, padding: 8, marginBottom: 16, borderRadius: 4 },
  userItem: { padding: 8, marginVertical: 4, borderWidth: 1, borderRadius: 4, backgroundColor: '#f9f9f9' },
});

export default UserAdminScreen;
