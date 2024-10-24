// screens/AdminMenuScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';





const AdminMenuScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu de Administração</Text>

      {/* Botões para os CRUDs */}
      <Button
        title="Gerenciamento de Usuários"
        onPress={() => navigation.navigate('UserAdminScreen')} // Navegar para CRUD de usuários
      />

      <Button
        title="Gerenciamento de Erros"
        onPress={() => navigation.navigate('ControleErroScreen')} // Navegar para CRUD de erros (tabela errors)
      />

      <Button
        title="Gerenciamento de Outros Erros"
        onPress={() => navigation.navigate('ControleComuScreen')} // Navegar para CRUD de erros (tabela error)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
});

export default AdminMenuScreen;

