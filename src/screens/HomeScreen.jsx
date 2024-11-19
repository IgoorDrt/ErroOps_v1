import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [popularErrors, setPopularErrors] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUserName(docSnapshot.data().nome || 'Usuário');
            } else {
              setUserName('Usuário');
            }
          });
          return () => unsubscribeSnapshot();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPopularErrors = () => {
      const errors = [
        { id: '1', name: 'Erro de Sintaxe', description: 'Um erro causado por digitação incorreta no código.' },
        { id: '2', name: 'Erro de Autenticação', description: 'Problemas ao validar credenciais do usuário.' },
        { id: '3', name: 'Erro de Depuração', description: 'Dificuldade em identificar falhas no código.' },
      ];
      setPopularErrors(errors);
    };

    fetchPopularErrors();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Saudação */}
        <View style={styles.header}>
          <Text style={styles.welcomeMessage}>Olá, {userName}!</Text>
          <Text style={styles.subtitle}>Estamos felizes em ter você aqui. Explore nossos recursos abaixo.</Text>
        </View>

        {/* Seção de Erros Populares */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Erros Populares</Text>
          <FlatList
            data={popularErrors}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Card sobre a empresa */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/image.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Sobre a ErrOops</Text>
            <Text style={styles.companyText}>
              A ErrOops é sua parceira para resolver problemas de código. Descubra soluções práticas, aprimore suas habilidades e junte-se à nossa comunidade!
            </Text>
          </View>
        </View>

        {/* Card sobre a equipe */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/team.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Nossa Equipe</Text>
            <Text style={styles.companyText}>
              Trabalhamos juntos para compartilhar conhecimentos e oferecer suporte que facilita sua jornada na programação.
            </Text>
          </View>
        </View>

        {/* Card sobre a comunidade */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/img33.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Comunidade ErrOops</Text>
            <Text style={styles.companyText}>
              Compartilhe seus erros e obtenha ajuda de outros programadores. Juntos, podemos aprender e resolver problemas!
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Community')}
            >
              <Text style={styles.buttonText}>Acesse a Comunidade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f4f4f4',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 10,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    width: width * 0.7,
    height: width * 0.4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a0b07', // Cor ajustada
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  companyImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#8a0b07',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
