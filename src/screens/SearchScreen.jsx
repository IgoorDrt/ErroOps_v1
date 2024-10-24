import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedErrors, setSuggestedErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRandomErrors = async () => {
    try {
      const q = collection(db, 'error'); // Busca todos os erros
      const querySnapshot = await getDocs(q);
      const allErrors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Seleciona até 3 erros aleatórios
      const randomErrors = allErrors.sort(() => 0.5 - Math.random()).slice(0, 3);
      setSuggestedErrors(randomErrors);
    } catch (error) {
      console.error("Erro ao buscar os erros sugeridos: ", error);
    }
  };

  useEffect(() => {
    fetchRandomErrors();
  }, []);

  const searchErrors = async (term) => {
    if (!term.trim()) {
      Alert.alert("Validação", "Por favor, insira um termo de busca.");
      return;
    }

    setLoading(true);
    setResults([]); // Limpa os resultados anteriores

    try {
      const q = collection(db, 'error');
      const querySnapshot = await getDocs(q);
      const searchResults = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((error) => error.nome?.toLowerCase().includes(term.toLowerCase()));

      if (searchResults.length === 0) {
        Alert.alert("Resultados", "Nenhum erro encontrado.");
      } else {
        setResults(searchResults);
      }
    } catch (error) {
      console.error("Erro ao buscar os dados: ", error);
      Alert.alert("Erro", "Erro ao buscar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultBox}>
      <Text style={styles.errorName}>{item.nome || 'Nome não disponível'}</Text>
      <Text style={styles.sectionTitle}>Explicação:</Text>
      <Text>{item.info || 'Informação não disponível'}</Text>
      <Text style={styles.sectionTitle}>Soluções:</Text>
      <Text>{item.solucao || 'Solução não disponível'}</Text>
      <Text style={styles.sectionTitle}>Exemplos:</Text>
      <Text>{item.exemplo || 'Exemplo não disponível'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ErrOops</Text>
      <Text style={styles.subtitle}>Como podemos te ajudar hoje?</Text>

      {/* Sugestões dinâmicas de erros */}
      <View style={styles.errorButtons}>
        {suggestedErrors.map((error, index) => (
          <TouchableOpacity
            key={index}
            style={styles.errorButton}
            onPress={() => searchErrors(error.nome)}>
            <Text style={styles.errorButtonText}>{error.nome || 'Erro'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Digite seu erro"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Botão de Pesquisa */}
      <TouchableOpacity style={styles.searchButton} onPress={() => searchErrors(searchTerm)}>
        <Text style={styles.searchButtonText}>Pesquisar</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loadingText}>Carregando...</Text>}

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        style={styles.resultList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#000',
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8a0b07',
    padding: 10,
    marginVertical: 20,
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  resultList: {
    marginTop: 20,
  },
  resultBox: {
    backgroundColor: '#f4f4f4',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorName: {
    fontWeight: 'bold',
    color: '#8a0b07',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#8a0b07',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'left',
  },
});

export default SearchScreen;
