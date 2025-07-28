import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, FlatList } from 'react-native';

interface LeaderboardProps {
  scores: number[];
  visible: boolean;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, visible, onClose }) => {
  const sorted = [...scores].sort((a, b) => b - a).slice(0, 10);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Liderlik Tablosu</Text>
          <FlatList
            data={sorted}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                <Text style={styles.rank}>{index + 1}.</Text>
                <Text style={styles.score}>{item}</Text>
              </View>
            )}
          />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#232946',
    borderRadius: 20,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eebbc3',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    width: 28,
  },
  score: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});

export default Leaderboard; 