import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ErrOops</Text>
      <Image 
        source={require('../../assets/iconeErrOops.png')}
        style={styles.image}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.loginText}>Ainda não tem uma conta? Registre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 40,
    color: '#8a0b07',
    marginBottom: 20,
  },
  image: {
    marginTop: 20,
    width: 600,
    height: 100,
    borderRadius: 50,
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#8a0b07',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  loginText: {
    color: '#8a0b07',
    textDecorationLine: 'underline',
  },
});
