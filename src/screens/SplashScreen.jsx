import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pausa antes da animação de saída
      setTimeout(() => {
        // Animação de saída
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Navegação para a próxima tela
          navigation.navigate('Welcome');
        });
      }, 1000); // Tempo de exibição da splash screen
    });
  }, [logoScale, textOpacity]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.appName,
          {
            transform: [{ scale: logoScale }],
            opacity: textOpacity,
          },
        ]}
      >
        ErrOops
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8a0b07',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
