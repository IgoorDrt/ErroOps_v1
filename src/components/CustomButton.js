import React from 'react-native';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, secondary }) => {
  const buttonStyle = secondary ? styles.secondaryButton : styles.primaryButton;
  const buttonTextStyle = secondary ? styles.secondaryButtonText : styles.primaryButtonText;

  return (
    <TouchableOpacity style={[styles.buttonContainer, buttonStyle]} onPress={onPress}>
      <Text style={[styles.buttonText, buttonTextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15, 
  },
  primaryButton: {
    backgroundColor: '#8a0b07',
  },
  secondaryButton: {
    backgroundColor: 'transparent', 
    borderWidth: 1,
    borderColor: '#8a0b07',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#8a0b07', 
  },
});

export default CustomButton;