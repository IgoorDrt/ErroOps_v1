import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { Image } from "expo-image";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

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
import CommunityCommentScreen from "../screens/CommunityCommentScreen";
import MyPostsScreen from "../screens/MyPostsScreen";
import TermsScreen from "../screens/TermosScreen";
import PrivacyScreen from "../screens/PrivacidadeScreen";
import { useTheme } from "react-native-paper";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
  authDomain: "erroops-93c8a.firebaseapp.com",
  projectId: "erroops-93c8a",
  storageBucket: "erroops-93c8a.appspot.com",
  messagingSenderId: "694707365976",
  appId: "1:694707365976:web:440ace5273d2c0aa4c022d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ProfileMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const navigation = useNavigation();

  const toggleModal = () => setModalVisible(!modalVisible);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "usuarios", user.uid), (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserPhoto(docSnapshot.data().profileImageUrl || null);
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleProfileEdit = () => {
    navigation.navigate("Profile");
    toggleModal();
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

const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const SideMenu = ({ menuVisible, toggleMenu, slideAnim, toggleTheme, theme }) => {
  const navigation = useNavigation();

  return (
    <Modal transparent={true} visible={menuVisible} onRequestClose={toggleMenu}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.menuContainer2, { backgroundColor: theme === 'light' ? '#fff' : '#333', transform: [{ translateX: slideAnim }] }]}>
          <ScrollView contentContainerStyle={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem2} onPress={() => { toggleMenu(); navigation.navigate("MyPosts"); }}>
              <Text style={[styles.menuText2, { color: theme === 'light' ? '#000' : '#fff' }]}>Meus Posts e Comentários</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem2} onPress={() => { toggleMenu(); navigation.navigate("Politica"); }}>
              <Text style={[styles.menuText2, { color: theme === 'light' ? '#000' : '#fff' }]}>Política de Privacidade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem2} onPress={() => { toggleMenu(); navigation.navigate("Termos"); }}>
              <Text style={[styles.menuText2, { color: theme === 'light' ? '#000' : '#fff' }]}>Termos de Uso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem2} onPress={() => { toggleMenu(); toggleTheme(); }}>
              <Text style={[styles.menuText2, { color: theme === 'light' ? '#000' : '#fff' }]}>Mudar Tema</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function AppNavigator() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [theme, setTheme] = useState('light');
  const slideAnim = useRef(new Animated.Value(-Dimensions.get("window").width * 0.5)).current;

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -Dimensions.get("window").width * 0.5 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: theme === 'light' ? '#f5f5f5' : '#222' }}>
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
              name="CommunityCommentScreen"
              component={CommunityCommentScreen}
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
              name="Politica"
              component={PrivacyScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Termos"
              component={TermsScreen}
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
              name="MyPosts"
              component={MyPostsScreen}
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
                title: "",
                headerLeft: () => (
                  <TouchableOpacity onPress={toggleMenu} style={{ paddingLeft: 20 }}>
                    <MaterialCommunityIcons name="menu" size={24} color="#fff" />
                  </TouchableOpacity>
                ),
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
          <SideMenu menuVisible={menuVisible} toggleMenu={toggleMenu} slideAnim={slideAnim} toggleTheme={toggleTheme} theme={theme} />
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

function TabNavigator() {
  const theme = useTheme(); 
  theme.colors.secondaryContainer = "transparent";
  return (
    <Tab.Navigator barStyle={{ backgroundColor: "#8a0b07" }} activeColor="black" inactiveColor="#ffffff">
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayBackground: {
    flex: 1,
  },
  menuContainer2: {
    width: "50%",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    padding: 20,
  },
  menuContent: {
    paddingVertical: 20,
  },
  menuItem2: {
    paddingVertical: 15,
  },
  menuText2: {
    fontSize: 16,
  },
});
