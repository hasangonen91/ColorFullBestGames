import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type MoveCounterProps = {
  moves: number;
};

const MoveCounter: React.FC<MoveCounterProps> = ({ moves }) => (
  <View style={styles.container}>
    <Text style={styles.label}>Hamle:</Text>
    <Text style={styles.value}>{moves}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232946',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  label: {
    color: '#eebbc3',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 6,
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default MoveCounter; 