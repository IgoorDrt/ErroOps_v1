import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, Text, Dimensions, TouchableWithoutFeedback } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { Image } from "expo-image"; // Importa expo-image
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useTheme } from "react-native-paper";

// Importando suas telas
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CommentScreen from "../screens/CommentScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import CommunityScreen from "../screens/CommunityScreen";
import EmpresaScreen from "../screens/EmpresaScreen";
import ResetPassword from "../screens/ResetPasswordScreen";
import SearchChatScreen from "../screens/SearchChatScreen"; // Importando a tela
import AdminMenuScreen from "../screens/PainelAdmScreen";
import UserAdminScreen from "../screens/UserAdminScreen";
import ControleErroScreen from "../screens/ControleErroScreen";
import ControleComuScreen from "../screens/ControleComuScreen";
import PostagemScreen from "../screens/PostagemScreen";
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Componente de Menu do Perfil
const ProfileMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const navigation = useNavigation();

  const toggleModal = () => setModalVisible(!modalVisible);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserPhoto(docSnap.data().profileImageUrl || null); // Define a foto do usuário
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login"); // Navega para a tela de login após logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleProfileEdit = () => {
    navigation.navigate("Profile");
    toggleModal(); // Fecha o modal
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={toggleModal}>
        {userPhoto ? (
          <Image source={{ uri: userPhoto }} style={styles.profileImage} />
        ) : (
          <MaterialCommunityIcons name="account-circle" size={40} color="black" />
        )}
      </TouchableOpacity>

      {/* Modal para o menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleProfileEdit}>
              <Text style={styles.menuItem}>Editar Perfil</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.menuItem}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Setup de Navegação
const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostagemScreen"
          component={PostagemScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PainelAdm"
          component={AdminMenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserAdminScreen"
          component={UserAdminScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ControleErroScreen"
          component={ControleErroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ControleComuScreen"
          component={ControleComuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchChatScreen"
          component={SearchChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CommentScreen"
          component={CommentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            headerRight: () => <ProfileMenu />,
            headerStyle: { backgroundColor: "#8a0b07" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            title: "", // Remove o título da tela Main
            headerLeft: null, // Remove a seta da esquerda
          }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            title: "", // Remove o título
            headerStyle: { backgroundColor: "#8a0b07" },
            headerTintColor: "#fff",
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 20 }}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            ),
            headerBackTitleVisible: false, // Remove o título do botão de voltar
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Tab Navigation
function TabNavigator() {
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent";

  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: "#8a0b07" }}
      activeColor="black"
      inactiveColor="#ffffff"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Página Inicial",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Pesquisar",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: "Comunidade",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="EmpresaScreen"
        component={EmpresaScreen}
        options={{
          title: "Empresas",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="briefcase-eye" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Estilos da Navbar e ProfileMenu
const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 200,
    elevation: 5,
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    fontSize: 16,
    padding: 10,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
  },
});
