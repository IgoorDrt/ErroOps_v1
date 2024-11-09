import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones para a flecha
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ControleErroScreen = ({ navigation }) => {
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Flecha para voltar ao Menu de Administração */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <Text style={styles.title}>Gerenciamento de Erros</Text>

      {/* Inputs para os campos do erro */}
      <TextInput
        style={styles.input}
        placeholder="Exemplo"
        placeholderTextColor="#000"
        value={newError.exemplo}
        onChangeText={(text) => setNewError({ ...newError, exemplo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Info"
        placeholderTextColor="#000"
        value={newError.info}
        onChangeText={(text) => setNewError({ ...newError, info: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#000"
        value={newError.nome}
        onChangeText={(text) => setNewError({ ...newError, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Solução"
        placeholderTextColor="#000"
        value={newError.solucao}
        onChangeText={(text) => setNewError({ ...newError, solucao: text })}
      />

      {/* Botão para adicionar ou atualizar */}
      <TouchableOpacity
        style={styles.button}
        onPress={selectedError ? handleUpdateError : handleAddError}
      >
        <Text style={styles.buttonText}>{selectedError ? "Atualizar Erro" : "Adicionar Erro"}</Text>
      </TouchableOpacity>

      {/* Lista de erros */}
      <FlatList
        data={errors}
        keyExtractor={error => error.id}
        renderItem={({ item }) => (
          <View style={styles.errorItem}>
            <Text style={styles.errorText}>Nome: {item.nome}</Text>
            <Text style={styles.errorText}>Exemplo: {item.exemplo}</Text>
            <Text style={styles.errorText}>Info: {item.info}</Text>
            <Text style={styles.errorText}>Solução: {item.solucao}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => { setNewError(item); setSelectedError(item); }}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteError(item.id)}
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
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  backButton: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#8a0b07', textAlign: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#8a0b07', padding: 12, marginBottom: 16, borderRadius: 4, color: '#000' },
  button: { backgroundColor: '#8a0b07', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorItem: { padding: 16, marginVertical: 8, borderWidth: 1, borderRadius: 8, borderColor: '#8a0b07', backgroundColor: '#f9f9f9' },
  errorText: { color: '#000', marginBottom: 4 },
  editButton: { backgroundColor: '#8a0b07', padding: 8, borderRadius: 4, marginBottom: 4 },
  deleteButton: { backgroundColor: '#8a0b07', padding: 8, borderRadius: 4 }
});

export default ControleErroScreen;
