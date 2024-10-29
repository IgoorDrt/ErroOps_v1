import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState('');

  // Obtém o nome do usuário logado
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || 'Usuário');
    }
  }, []);

  // Carrega as postagens do Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'errors'));
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>Bem-vindo, {userName}!</Text>

      {/* Card sobre a empresa */}
      <View style={styles.infoCard}>
        <Image source={require('../../assets/image.png')} style={styles.companyImage} />
        <View style={styles.companyInfo}>
          <Text style={styles.companyText}>
            A ErrOops é sua parceira para resolver problemas de código. Estamos aqui para ajudar você a superar desafios, fornecer suporte técnico e aprimorar suas habilidades em programação. Junte-se à nossa comunidade e descubra soluções práticas para seus erros de código!
          </Text>
        </View>
      </View>

      {/* Card sobre a equipe */}
      <View style={styles.infoCard}>
        <Image source={require('../../assets/team.png')} style={styles.companyImage} />
        <View style={styles.companyInfo}>
          <Text style={styles.companyText}>
            Na ErrOops, trabalhamos juntos para oferecer o melhor suporte e compartilhar conhecimentos que facilitam a resolução de erros de programação. Conte conosco para evoluir em sua jornada!
          </Text>
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  welcomeMessage: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  infoCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 30,  
    borderRadius: 8, 
    marginBottom: 25, 
    elevation: 3 
  },
  companyImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 8, 
    marginRight: 20 
  },
  companyInfo: { flex: 1 },
  companyText: { fontSize: 14, color: '#555', textAlign: 'justify' },
});

export default HomeScreen;
