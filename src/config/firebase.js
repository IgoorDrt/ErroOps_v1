import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDcQU6h9Hdl_iABchuS3OvK-xKB44Gt43Y",
    authDomain: "erroops-93c8a.firebaseapp.com",
    projectId: "erroops-93c8a",
    storageBucket: "erroops-93c8a.appspot.com",
    messagingSenderId: "694707365976",
    appId: "1:694707365976:web:440ace5273d2c0aa4c022d"
  };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa o Firestore
const auth = getAuth(app); // Inicializa a autenticação

export { auth, db };