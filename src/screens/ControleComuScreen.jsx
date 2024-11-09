import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ControleComuScreen = ({ navigation }) => {
  const [errors, setErrors] = useState([]);
  const [newError, setNewError] = useState({
    email: '',
    text: '',
    commentText: '',
  });
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    fetchErrors();
  }, []);

  // Função para buscar erros do Firestore
  const fetchErrors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'errors'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setErrors(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  // Função para adicionar um novo erro
  const handleAddError = async () => {
    if (newError.email && newError.text && newError.commentText) {
      try {
        await addDoc(collection(db, 'errors'), newError);
        fetchErrors(); // Atualiza a lista após adicionar
        setNewError({ email: '', text: '', commentText: '' });
      } catch (error) {
        console.error("Erro ao adicionar erro:", error);
      }
    } else {
      alert("Por favor, preencha todos os campos");
    }
  };

  // Função para atualizar um erro existente
  const handleUpdateError = async () => {
    if (selectedError) {
      try {
        const errorRef = doc(db, 'errors', selectedError.id);
        await updateDoc(errorRef, newError);
        fetchErrors(); // Atualiza a lista após atualizar
        setSelectedError(null);
        setNewError({ email: '', text: '', commentText: '' });
      } catch (error) {
        console.error("Erro ao atualizar erro:", error);
      }
    }
  };

  // Função para deletar um erro
  const handleDeleteError = async (id) => {
    try {
      await deleteDoc(doc(db, 'errors', id));
      fetchErrors(); // Atualiza a lista após deletar
    } catch (error) {
      console.error("Erro ao deletar erro:", error);
    }
  };

  // Formata a data do timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    const date = timestamp.toDate();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <Text style={styles.title}>Gerenciamento de Erros</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={newError.email}
          onChangeText={(text) => setNewError({ ...newError, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Texto do Erro"
          placeholderTextColor="#555"
          value={newError.text}
          onChangeText={(text) => setNewError({ ...newError, text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Texto do Comentário"
          placeholderTextColor="#555"
          value={newError.commentText}
          onChangeText={(text) => setNewError({ ...newError, commentText: text })}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={selectedError ? handleUpdateError : handleAddError}
        >
          <Text style={styles.buttonText}>{selectedError ? "Atualizar Erro" : "Adicionar Erro"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={errors}
        keyExtractor={(error) => error.id}
        renderItem={({ item }) => (
          <View style={styles.errorItem}>
            <Text style={styles.errorText}>Email: {item.email || 'Não disponível'}</Text>
            <Text style={styles.errorText}>Erro: {item.text || 'Não disponível'}</Text>
            <Text style={styles.errorText}>Comentário: {item.commentText || 'Não disponível'}</Text>

            {item.timestamp && (
              <Text style={styles.errorText}>Data: {formatDate(item.timestamp)}</Text>
            )}

            {item.profileImageUrl ? (
              <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
            ) : (
              <Text style={styles.errorText}>Imagem de perfil não disponível</Text>
            )}

            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.errorImage} />
            )}

            <Text style={styles.errorText}>Curtidas: {item.likes ? item.likes.length : 0}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={() => { setNewError(item); setSelectedError(item); }} style={styles.editButton}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteError(item.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
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
  form: { marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#8a0b07', padding: 12, marginBottom: 12, borderRadius: 4, color: '#000' },
  button: { backgroundColor: '#8a0b07', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorItem: { padding: 16, marginVertical: 8, borderWidth: 1, borderRadius: 8, borderColor: '#8a0b07', backgroundColor: '#f9f9f9' },
  errorText: { color: '#000', marginBottom: 4 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginTop: 8 },
  errorImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  editButton: { backgroundColor: '#8a0b07', padding: 8, borderRadius: 4, alignItems: 'center', marginRight: 4 },
  deleteButton: { backgroundColor: '#8a0b07', padding: 8, borderRadius: 4, alignItems: 'center' },
});

export default ControleComuScreen;
