import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
    authDomain: "erroops-93c8a.firebaseapp.com",
    projectId: "erroops-93c8a",
    storageBucket: "erroops-93c8a.appspot.com",
    messagingSenderId: "694707365976",
    appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
};

// Inicializando o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// Inicializando a autenticação e o Firestore do Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Exportando para uso em outros arquivos
export { app, auth, db };
