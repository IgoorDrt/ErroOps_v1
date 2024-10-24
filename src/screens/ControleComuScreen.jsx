// screens/ErrorAdminScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ControleComuScreen = () => {
  const [errors, setErrors] = useState([]);
  const [newError, setNewError] = useState({
    email: '',
    text: '',
    comments: '',
    commentText: ''
  });
  const [selectedError, setSelectedError] = useState(null);

  // Busca os dados da coleção "errors" do Firestore
  useEffect(() => {
    const fetchErrors = async () => {
      const querySnapshot = await getDocs(collection(db, 'errors'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setErrors(data);
    };

    fetchErrors();
  }, []);

  // Adicionar novo erro à coleção "errors"
  const handleAddError = async () => {
    if (newError.email && newError.text && newError.comments && newError.commentText) {
      await addDoc(collection(db, 'errors'), newError);
      setNewError({ email: '', text: '', comments: '', commentText: '' });
    }
  };

  // Atualizar um erro existente na coleção "errors"
  const handleUpdateError = async () => {
    if (selectedError) {
      const errorRef = doc(db, 'errors', selectedError.id);
      await updateDoc(errorRef, newError);
      setSelectedError(null);
      setNewError({ email: '', text: '', comments: '', commentText: '' });
    }
  };

  // Deletar um erro da coleção "errors"
  const handleDeleteError = async (id) => {
    await deleteDoc(doc(db, 'errors', id));
  };

  return (

    

    <View style={styles.container}>
      <Text>Gerenciamento de Erros</Text>
      <Button
        title="Voltar para o Menu de Administração"
        onPress={() => navigation.navigate('AdminMenuScreen')}
      />
      {/* Inputs para os campos do erro */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={newError.email}
        onChangeText={(text) => setNewError({ ...newError, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Texto"
        value={newError.text}
        onChangeText={(text) => setNewError({ ...newError, text: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Comentários"
        value={newError.comments}
        onChangeText={(text) => setNewError({ ...newError, comments: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Texto do Comentário"
        value={newError.commentText}
        onChangeText={(text) => setNewError({ ...newError, commentText: text })}
      />

      {/* Botão para adicionar ou atualizar */}
      <Button
        title={selectedError ? "Atualizar Erro" : "Adicionar Erro"}
        onPress={selectedError ? handleUpdateError : handleAddError}
      />

      {/* Lista de erros */}
      <FlatList
        data={errors}
        keyExtractor={error => error.id}
        renderItem={({ item }) => (
          <View style={styles.errorItem}>
            <Text>Email: {item.email}</Text>
            <Text>Texto: {item.text}</Text>
            <Text>Comentários: {item.comments}</Text>
            <Text>Texto do Comentário: {item.commentText}</Text>
            <Button title="Editar" onPress={() => { setNewError(item); setSelectedError(item); }} />
            <Button title="Deletar" onPress={() => handleDeleteError(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, padding: 8, marginBottom: 16, borderRadius: 4 },
  errorItem: { padding: 8, marginVertical: 4, borderWidth: 1, borderRadius: 4, backgroundColor: '#f9f9f9' },
});

export default ControleComuScreen;
