import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Image,
  Platform,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "react-native-vector-icons";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { launchImageLibrary } from "react-native-image-picker";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const storage = getStorage();

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageUri, setImageUri] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [accountExistsModal, setAccountExistsModal] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android:
        "694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com",
      ios: "694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com",
      web: "694707365976-r15gj03skca9f8sfe9snbafdk7s47jkd.apps.googleusercontent.com",
    }),
  });
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleGoogleLogin(credential);
    }
  }, [response]);

  const selectProfileImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (!response.didCancel && !response.error && response.assets) {
        const selectedImage = response.assets[0];
        setProfileImage(selectedImage);
        setImageUri(selectedImage.uri);
      }
    });
  };

  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      return false;
    }
  };

  const handleRegister = async () => {
    if (!agreedToTerms) {
      setError(
        "Você deve concordar com os Termos de Uso e a Política de Privacidade."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    const emailExists = await checkEmailExists(email);

    if (emailExists) {
      setAccountExistsModal(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let profileImageUrl = null;

      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        const img = await fetch(profileImage.uri);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: name,
        email: user.email,
        uid: user.uid,
        profileImageUrl: profileImageUrl,
        autenticacao: 1,
      });

      navigation.navigate("Login");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const emailExists = await checkEmailExists(user.email);

      if (emailExists) {
        setAccountExistsModal(true);
        return;
      }

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: user.displayName || "Usuário Google",
        email: user.email,
        uid: user.uid,
        profileImageUrl: user.photoURL,
        autenticacao: 1,
      });

      navigation.navigate("Main");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Registrar-se</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
      ) : null}

      <TouchableOpacity style={styles.button} onPress={selectProfileImage}>
        <Text style={styles.buttonText}>Escolher Foto</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Icon
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color="#8a0b07"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        >
          <Icon
            name={isConfirmPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color="#8a0b07"
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.termsContainer}>
        <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)}>
          <Icon
            name={agreedToTerms ? "checkbox" : "square-outline"}
            size={24}
            color="#8a0b07"
          />
        </TouchableOpacity>
        <Text style={styles.termsText}>
          Eu concordo com os
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Termos")}
          >
            {" "}
            Termos de Uso{" "}
          </Text>
          e a
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Politica")}
          >
            {" "}
            Política de Privacidade
          </Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
      >
        <FontAwesome name="google" size={24} color="#8a0b07" />
      </TouchableOpacity>

      <Modal
        visible={accountExistsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAccountExistsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Este e-mail já está cadastrado.
            </Text>
            <Text style={styles.modalText}>
              Por favor, faça login ou use outro e-mail.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAccountExistsModal(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#8a0b07",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 0,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#8a0b07",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#8a0b07",
    borderWidth: 2,
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#8a0b07",
    padding: 10,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#8a0b07",
    marginLeft: 10,
  },
  link: {
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#8a0b07",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
