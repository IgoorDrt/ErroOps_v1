import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const HomeScreen = () => {
  const [userName, setUserName] = useState('');

  // Obtém o nome do usuário logado em tempo real
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.welcomeMessage}>Bem-vindo, {userName}!</Text>

        {/* Card sobre a empresa */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/image.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Sobre</Text>
            <Text style={styles.companyText}>
              A ErrOops é sua parceira para resolver problemas de código. Estamos aqui para ajudar você a superar desafios, fornecer suporte técnico e aprimorar suas habilidades em programação. Junte-se à nossa comunidade e descubra soluções práticas para seus erros de código!
            </Text>
          </View>
        </View>

        {/* Card sobre a equipe */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/team.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Nossa Equipe</Text>
            <Text style={styles.companyText}>
              Na ErrOops, trabalhamos juntos para oferecer o melhor suporte e compartilhar conhecimentos que facilitam a resolução de erros de programação. Conte conosco para evoluir em sua jornada!
            </Text>
          </View>
        </View>

        {/* Card sobre a comunidade */}
        <View style={styles.infoCard}>
          <Image source={require('../../assets/img33.png')} style={styles.companyImage} />
          <View style={styles.companyInfo}>
            <Text style={styles.cardTitle}>Comunidade ErrOops</Text>
            <Text style={styles.companyText}>
              Descubra a Comunidade da ErrOops, onde você pode compartilhar seus erros e obter ajuda de outros programadores. Colabore, aprenda e ajude a resolver problemas juntos!
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
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8a0b07',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
    elevation: 3,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8a0b07',
  },
  companyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
  },
});

export default HomeScreen;
