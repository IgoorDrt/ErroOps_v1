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
            A ErrOops é sua parceira para resolver problemas de código. Estamos aqui para ajudar você a superar desafios, fornecer suporte técnico, e aprimorar suas habilidades em programação. Junte-se à nossa comunidade e descubra soluções práticas para seus erros de código!
          </Text>
        </View>
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  welcomeMessage: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  infoCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 8, 
    marginBottom: 20, 
    elevation: 3 
  },
  companyImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    marginRight: 15 
  },
  companyInfo: { flex: 1 },
  companyText: { fontSize: 16, color: '#555', textAlign: 'justify' },
});

export default HomeScreen;
