import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedErrors, setSuggestedErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState(null);
  const navigation = useNavigation();

  const fetchRandomErrors = async () => {
    try {
      const q = collection(db, 'error');
      const querySnapshot = await getDocs(q);
      const allErrors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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
    setResults([]);

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

  const copyToClipboard = async (text, id) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedTextId(id);
      Alert.alert("Copiado", "A mensagem foi copiada para a área de transferência.");
      setTimeout(() => setCopiedTextId(null), 2000);
    } catch (error) {
      console.error("Erro ao copiar o texto: ", error);
      Alert.alert("Erro", "Não foi possível copiar o texto.");
    }
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultBox}>
      <Text style={styles.errorName}>{item.nome || 'Nome não disponível'}</Text>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Explicação:</Text>
        <View style={styles.textContainer}>
          <Text style={styles.sectionText}>{item.info || 'Informação não disponível'}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(item.info, `${item.id}-info`)}>
            <Icon name="content-copy" size={20} color={copiedTextId === `${item.id}-info` ? '#8a0b07' : '#aaa'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Soluções:</Text>
        <View style={styles.textContainer}>
          <Text style={styles.sectionText}>{item.solucao || 'Solução não disponível'}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(item.solucao, `${item.id}-solucao`)}>
            <Icon name="content-copy" size={20} color={copiedTextId === `${item.id}-solucao` ? '#8a0b07' : '#aaa'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Exemplos:</Text>
        <View style={styles.textContainer}>
          <Text style={styles.sectionText}>{item.exemplo || 'Exemplo não disponível'}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(item.exemplo, `${item.id}-exemplo`)}>
            <Icon name="content-copy" size={20} color={copiedTextId === `${item.id}-exemplo` ? '#8a0b07' : '#aaa'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>ErrOops</Text>
      <Text style={styles.subtitle}>Como podemos te ajudar hoje?</Text>

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

      <TouchableOpacity style={styles.searchButton} onPress={() => searchErrors(searchTerm)}>
        <Text style={styles.searchButtonText}>Pesquisar</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loadingText}>Carregando...</Text>}

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        style={styles.resultList}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#8a0b07',
    padding: 10,
    borderRadius: 20,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#8a0b07',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#8a0b07',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  errorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#8a0b07',
    marginBottom: 5,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  sectionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
});

export default SearchScreen;
