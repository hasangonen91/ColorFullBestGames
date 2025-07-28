import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type UndoButtonProps = {
  onUndo: () => void;
  disabled?: boolean;
};

const UndoButton: React.FC<UndoButtonProps> = ({ onUndo, disabled }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
    ]}
    onPress={onUndo}
    disabled={disabled}
  >
    <Ionicons name="arrow-undo" size={22} color={disabled ? '#aaa' : '#eebbc3'} />
    <Text style={[styles.text, { color: disabled ? '#aaa' : '#eebbc3' }]}>Geri Al</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232946',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: '#171F52',
  },
});

export default UndoButton; 