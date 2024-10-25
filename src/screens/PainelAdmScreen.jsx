import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AdminMenuScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu de Administração</Text>

      {/* Botões para os CRUDs */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UserAdminScreen')}
      >
        <Text style={styles.buttonText}>Gerenciamento de Usuários</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ControleErroScreen')}
      >
        <Text style={styles.buttonText}>Gerenciamento de Erros</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ControleComuScreen')}
      >
        <Text style={styles.buttonText}>Gerenciamento Comunidade</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#8a0b07', 
    marginBottom: 32, 
    textAlign: 'center' 
  },
  button: { 
    backgroundColor: '#8a0b07', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16, 
    width: '80%' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default AdminMenuScreen;
