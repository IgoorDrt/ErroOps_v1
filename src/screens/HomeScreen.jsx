import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [theme, setTheme] = useState('light'); // Estado para o tema

  // Obtém o nome do usuário logado
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          // Busca o nome no Firestore caso o displayName não esteja disponível
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().nome || 'Usuário');
          } else {
            setUserName('Usuário');
          }
        }
      }
    };
    fetchUserName();
  }, []);

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Estilos dinâmicos com base no tema
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#333',
    },
    welcomeMessage: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'light' ? '#8a0b07' : '#fff',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#fff' : '#444',
      padding: 20,
      borderRadius: 8,
      marginBottom: 25,
      elevation: 3,
    },
    companyText: {
      fontSize: 14,
      color: theme === 'light' ? '#555' : '#ccc',
      textAlign: 'justify',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'light' ? '#8a0b07' : '#fff',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.welcomeMessage}>Bem-vindo, {userName}!</Text>

        {/* Botão para mudar o tema */}
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>Mudar Tema</Text>
        </TouchableOpacity>

        {/* Card sobre a empresa */}
        <View style={dynamicStyles.infoCard}>
          <Image source={require('../../assets/image.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={dynamicStyles.cardTitle}>Sobre</Text>
            <Text style={dynamicStyles.companyText}>
              A ErrOops é sua parceira para resolver problemas de código. Estamos aqui para ajudar você a superar desafios, fornecer suporte técnico e aprimorar suas habilidades em programação. Junte-se à nossa comunidade e descubra soluções práticas para seus erros de código!
            </Text>
          </View>
        </View>

        {/* Card sobre a equipe */}
        <View style={dynamicStyles.infoCard}>
          <Image source={require('../../assets/team.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={dynamicStyles.cardTitle}>Nossa Equipe</Text>
            <Text style={dynamicStyles.companyText}>
              Na ErrOops, trabalhamos juntos para oferecer o melhor suporte e compartilhar conhecimentos que facilitam a resolução de erros de programação. Conte conosco para evoluir em sua jornada!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 10,
  },
  themeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#8a0b07',
    borderRadius: 8,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  companyImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 20,
  },
  companyInfo: {
    flex: 1,
  },
});

export default HomeScreen;
