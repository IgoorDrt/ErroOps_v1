import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
 
export default function TermsScreen() {
  const navigation = useNavigation();
 
  return (
<View style={styles.container}>
      {/* Cabeçalho */}
<View style={styles.header}>
<Text style={styles.headerText}>ErrOops</Text>
</View>
 
      {/* Conteúdo */}
<ScrollView contentContainerStyle={styles.content}>
<Text style={styles.title}>Termos de Uso - ErrOops</Text>
<Text style={styles.text}>
  <Text style={{ fontWeight: 'bold' }}>Bem-vindo(a) ao ErrOops!{'\n'}</Text>
  Estes Termos de Uso (ou "Termos") regem o uso do ErrOops, exceto quando expressamente afirmado que outros termos se aplicam, e fornecem informações sobre o Serviço do ErrOops (o "Serviço"), descrito abaixo. Ao usar ou criar uma conta no ErrOops, você concorda com estes Termos.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>O ErrOops é um site sobre erros e como solucioná-los,{'\n'}</Text>
  com login, senha e uma comunidade interativa. Estes Termos constituem um acordo entre você e o ErrOops.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>O Serviço do ErrOops{'\n'}</Text>
  Concordamos em fornecer a você o Serviço do ErrOops, que inclui as ferramentas e tecnologias para promover a missão da plataforma: ajudar os usuários a identificar e solucionar erros, compartilhando conhecimentos e experiências relevantes. O Serviço inclui:{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Personalização e Soluções{'\n'}</Text>
  Oferecemos oportunidades para você descobrir, compartilhar e discutir erros e suas soluções com uma comunidade dedicada. Para facilitar sua experiência, utilizamos sistemas que personalizam conteúdos com base nos erros que você e outros usuários encontram, tanto dentro quanto fora da plataforma. Para proporcionar uma experiência mais personalizada, o ErrOops permite que você adicione uma imagem de perfil através da câmera ou da galeria de seu dispositivo, tornando seu perfil único na comunidade.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Ambiente Seguro e Inclusivo{'\n'}</Text>
  Nosso compromisso é criar um ambiente seguro e acolhedor. Utilizamos ferramentas e equipes dedicadas para monitorar comportamentos que possam ser prejudiciais, combatendo abusos e violações de nossos Termos. Quando necessário, podemos compartilhar informações com autoridades competentes para manter o ambiente seguro para todos os usuários.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Uso de Tecnologias Avançadas{'\n'}</Text>
  Para melhorar constantemente a plataforma, usamos tecnologias avançadas como inteligência artificial, garantindo que o serviço funcione de maneira eficaz e escalável para nossa comunidade global. Essas tecnologias também nos ajudam a proteger a plataforma e personalizar sua experiência.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Conectar Você com Soluções Relevantes{'\n'}</Text>
  Utilizamos dados do ErrOops e de parceiros para exibir conteúdo relevante e patrocinado que possa ser de seu interesse, sem comprometer sua privacidade. Não vendemos suas informações pessoais para anunciantes.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Pesquisa e Inovação{'\n'}</Text>
  Utilizamos informações da comunidade para estudar, aprimorar o Serviço e colaborar com terceiros em pesquisas que ajudem a melhorar a experiência e resolver problemas comuns.{'\n'}{'\n'}

  Ao utilizar o ErrOops, você concorda com nossos Termos de Uso.{'\n\n'}
</Text>

</ScrollView>
 
      {/* Botão de Voltar */}
<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
<Text style={styles.backButtonText}>Voltar</Text>
</TouchableOpacity>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#8a0b07',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a0b07',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#8a0b07',
    padding: 12,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

