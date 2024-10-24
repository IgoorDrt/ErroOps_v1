// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
// import { getAuth } from 'firebase/auth';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';
// import { useNavigation } from '@react-navigation/native';

// const { width: screenWidth } = Dimensions.get('window');

// const HomeScreen = () => {
//   const [userName, setUserName] = useState('');
//   const carouselRef = useRef(null);
//   const auth = getAuth();
//   const db = getFirestore();
//   const navigation = useNavigation();

 
//   useEffect(() => {
//     const fetchUserName = async () => {
//       const user = auth.currentUser;
//       if (user) {
//         const userDoc = doc(db, 'usuarios', user.uid);
//         const userSnap = await getDoc(userDoc);
//         if (userSnap.exists()) {
//           const userData = userSnap.data();
//           setUserName(userData.nome);
//         }
//       }
//     };
//     fetchUserName();
//   }, []);

  

//   return (
//     <View style={styles.container}>
//       <View style={styles.navbar}>
//         <Text style={styles.welcomeText}>Olá, {userName}!</Text>
//       </View>

//       <Text style={styles.heading}>Como podemos te ajudar hoje?</Text>

      
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     padding: 20,
//   },
//   navbar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   logo: {
//     width: 50,
//     height: 50,
//   },
//   welcomeText: {
//     fontSize: 18,
//     color: '#8a0b07',
//     fontWeight: '600',
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#8a0b07',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   quickActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 30,
//   },
//   actionButton: {
//     backgroundColor: '#8a0b07',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },
//   actionText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   carouselContainer: {
//     marginTop: 30,
//   },
//   errorCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   errorTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#8a0b07',
//     marginBottom: 10,
//   },
//   errorDescription: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
// });

// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase'; // Sua instância do Firebase Firestore

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);

  // Carrega as postagens do Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'errors')); // Supondo que a coleção de postagens seja 'posts'
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  // Renderiza cada item da lista
  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      {/* Header da postagem */}
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
      </View>

      {/* Conteúdo da postagem */}
      <Text style={styles.postText}>{item.text}</Text>

      {/* Se houver uma imagem na postagem */}
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}

      {/* Botões de ação */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text>👍 {item.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text>👎 {item.downvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text>💬 {item.commentsCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text>🔗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  postCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  username: { fontWeight: 'bold', fontSize: 16 },
  postText: { fontSize: 14, marginBottom: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
});

export default HomeScreen;
