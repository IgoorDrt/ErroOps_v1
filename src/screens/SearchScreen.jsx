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
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginVertical: height * 0.02,
  },
  subtitle: {
    fontSize: width * 0.045,
    color: '#555',
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: width * 0.03,
    marginBottom: height * 0.02,
  },
  errorButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.05,
    marginHorizontal: width * 0.02,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.035,
  },
  input: {
    borderWidth: 1,
    borderColor: '#8a0b07',
    padding: height * 0.02,
    marginVertical: height * 0.02,
    borderRadius: width * 0.03,
    fontSize: width * 0.04,
    backgroundColor: '#f9f9f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#8a0b07',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.03,
    alignItems: 'center',
    marginBottom: height * 0.03,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  resultBox: {
    backgroundColor: '#ffffff',
    padding: height * 0.02,
    borderRadius: width * 0.04,
    marginBottom: height * 0.025,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  errorName: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: height * 0.02,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#8a0b07',
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: height * 0.015,
    borderRadius: width * 0.03,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionText: {
    flex: 1,
    color: '#333',
    fontSize: width * 0.04,
    marginRight: width * 0.03,
  },
});

export default SearchScreen;
