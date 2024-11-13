import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
 
export default function PrivacyScreen() {
  const navigation = useNavigation();
 
  return (
<View style={styles.container}>
      {/* Cabeçalho */}
<View style={styles.header}>
<Text style={styles.headerText}>ErrOops</Text>
</View>
 
      {/* Conteúdo */}
<ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Política de Privacidade</Text>

<Text style={styles.text}>
    
<Text style={{ fontWeight: 'bold' }}>Bem-vindo(a) ao ErrOops!{'\n'}</Text>
  Nossa Política de Privacidade descreve como coletamos e utilizamos suas informações. Você tem o controle sobre suas informações através das configurações de privacidade disponíveis em sua conta. Coletamos dados como nome, e-mail e interações no site, para personalizar sua experiência e melhorar o serviço. Suas informações são usadas para garantir a segurança da plataforma, exibir conteúdos e anúncios relevantes, além de aprimorar a solução de erros. Podemos compartilhar esses dados com parceiros de confiança e autoridades quando necessário.{'\n\n'}
  
  O ErrOops pode solicitar acesso à sua câmera e galeria para que você possa capturar ou selecionar uma imagem de perfil. Essas imagens serão armazenadas com segurança em nosso banco de dados e utilizadas apenas para personalização do seu perfil. Você tem o controle sobre a atualização e remoção da sua imagem de perfil através das configurações da conta. O ErrOops não utilizará suas imagens para nenhum outro fim sem o seu consentimento.{'\n\n'}
  
  Você tem controle sobre suas informações e pode gerenciar suas configurações de privacidade.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>Permissões para Empresas{'\n'}</Text>
  Empresas e empregadores podem utilizar o ErrOops para publicar vagas de emprego e informações relevantes sobre suas oportunidades de trabalho. Ao fazer isso, você, como representante de uma empresa, concorda com os seguintes termos específicos:{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Publicação de Vagas de Emprego:{'\n'}</Text>
  Empresas podem criar posts e descrever suas vagas de emprego, incluindo detalhes sobre responsabilidades, qualificações e benefícios oferecidos. É responsabilidade das empresas garantir que todas as informações fornecidas sejam precisas e atualizadas.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Uso de Imagens e Conteúdo Visual:{'\n'}</Text>
  Empresas têm permissão para fazer upload de imagens relacionadas às vagas de emprego, como fotos do ambiente de trabalho ou da equipe, com o objetivo de oferecer mais contexto sobre a cultura organizacional. Todas as imagens enviadas devem respeitar as diretrizes da plataforma, sendo vedado o uso de imagens impróprias ou que violem direitos de imagem.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Conformidade com as Diretrizes de Privacidade e Segurança:{'\n'}</Text>
  Empresas devem respeitar a privacidade dos candidatos e usuários da plataforma. É proibido solicitar informações sensíveis dos candidatos publicamente na plataforma e, caso haja coleta de dados, as empresas devem fazer isso de maneira ética e legal, de acordo com as leis de proteção de dados aplicáveis.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Restrições e Responsabilidade:{'\n'}</Text>
  As empresas não têm permissão para publicar conteúdos enganosos ou discriminatórios nas descrições de vagas. O ErrOops reserva-se o direito de remover qualquer publicação que viole nossos Termos de Uso ou nossas diretrizes de comunidade.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>• Política de Remoção de Conteúdo:{'\n'}</Text>
  Empresas podem solicitar a remoção ou atualização de suas publicações a qualquer momento por meio das configurações de conta ou contato direto com a equipe do ErrOops.{'\n\n'}

  Ao utilizar o ErrOops para promover vagas de emprego, as empresas concordam com estes termos específicos, além dos Termos de Uso gerais e da Política de Privacidade.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>Seus compromissos{'\n'}</Text>
  Em troca do nosso compromisso em fornecer o Serviço, solicitamos que você se comprometa com as seguintes regras:{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>Quem pode usar o ErrOops{'\n'}</Text>
  - Você deve ter pelo menos 13 anos ou a idade mínima legal no seu país.{'\n'}
  - Você não pode estar proibido de acessar o Serviço por determinação legal.{'\n'}
  - Sua conta não pode ter sido desativada por violar nossas políticas.{'\n\n'}

  <Text style={{ fontWeight: 'bold' }}>Como você não pode usar o ErrOops{'\n'}</Text>
  - Você não pode se passar por outra pessoa ou fornecer informações falsas.{'\n'}
  - Você não pode violar leis ou nossas políticas.{'\n'}
  - Não é permitido interferir no funcionamento da plataforma ou coletar dados de forma automatizada sem nossa permissão.{'\n'}
  - Não é permitido vender ou transferir sua conta ou dados obtidos da plataforma.{'\n'}
  - Você não pode compartilhar informações privadas ou confidenciais de outras pessoas sem permissão.{'\n'}
  - Não pode modificar ou criar trabalhos derivados de nossos produtos sem consentimento prévio.{'\n\n'}

  Ao utilizar o ErrOops, você concorda com nossa Política de Privacidade.{'\n\n'}


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

