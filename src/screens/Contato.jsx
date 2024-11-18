import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as MailComposer from 'expo-mail-composer';

const ContatoScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendEmail = () => {
    if (MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ['bolivia2steps@gmail.com'],
        subject: 'Contato pelo Aplicativo',
        body: `Mensagem de: ${email}\n\n${message}`,
      })
        .then(() => alert('E-mail enviado com sucesso!'))
        .catch(() => alert('Erro ao enviar o e-mail.'));
    } else {
      alert('O envio de e-mail não está disponível no dispositivo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Seu E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Sua Mensagem</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Digite sua mensagem"
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={styles.button} onPress={sendEmail}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#8a0b07',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
  },
  button: {
    backgroundColor: '#8a0b07',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ContatoScreen;
