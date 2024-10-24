// screens/AdminScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ControleErroScreen = () => {
  const [errors, setErrors] = useState([]);
  const [newError, setNewError] = useState({
    exemplo: '',
    info: '',
    nome: '',
    solucao: ''
  });
  const [selectedError, setSelectedError] = useState(null);

  // Busca os dados da coleção "error" do Firestore
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'error'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setErrors(data);
    };

    fetchData();
  }, []);

  // Adiciona um novo erro à coleção "error"
  const handleAddError = async () => {
    if (newError.exemplo && newError.info && newError.nome && newError.solucao) {
      await addDoc(collection(db, 'error'), newError);
      setNewError({ exemplo: '', info: '', nome: '', solucao: '' });
    }
  };

  // Atualiza um erro existente na coleção "error"
  const handleUpdateError = async () => {
    if (selectedError) {
      const errorRef = doc(db, 'error', selectedError.id);
      await updateDoc(errorRef, newError);
      setSelectedError(null);
      setNewError({ exemplo: '', info: '', nome: '', solucao: '' });
    }
  };

  // Deleta um erro da coleção "error"
  const handleDeleteError = async (id) => {
    await deleteDoc(doc(db, 'error', id));
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
        placeholder="Exemplo"
        value={newError.exemplo}
        onChangeText={(text) => setNewError({ ...newError, exemplo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Info"
        value={newError.info}
        onChangeText={(text) => setNewError({ ...newError, info: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={newError.nome}
        onChangeText={(text) => setNewError({ ...newError, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Solução"
        value={newError.solucao}
        onChangeText={(text) => setNewError({ ...newError, solucao: text })}
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
            <Text>Nome: {item.nome}</Text>
            <Text>Exemplo: {item.exemplo}</Text>
            <Text>Info: {item.info}</Text>
            <Text>Solução: {item.solucao}</Text>
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

export default ControleErroScreen;
