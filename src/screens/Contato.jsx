import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Linking, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';
import { Ionicons } from '@expo/vector-icons';

const ContatoScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigation = useNavigation();

  const sendEmail = async () => {
    if (Platform.OS === 'web') {
      const mailtoUrl = `mailto:bolivia2steps@gmail.com?subject=${encodeURIComponent(
        'Contato pelo Aplicativo'
      )}&body=${encodeURIComponent(`Mensagem de: ${email}\n\n${message}`)}`;
      Linking.openURL(mailtoUrl).catch(() =>
        alert('Erro ao tentar abrir o cliente de e-mail.')
      );
    } else {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho minimalista */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8a0b07" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <Text style={styles.title}>Entre em Contato</Text>
      <Text style={styles.description}>
        Caso tenha dúvidas, sugestões ou precise de suporte, envie-nos uma mensagem preenchendo os campos abaixo. Estamos sempre prontos para ajudar!
      </Text>
      <View style={styles.form}>
        <Text style={styles.label}>Seu E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8a0b07',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#8a0b07',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContatoScreen;
