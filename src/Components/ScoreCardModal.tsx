import React, { forwardRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';

interface ScoreCardModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  score: number;
  board: number[][];
}

const ScoreCardModal = forwardRef<View, ScoreCardModalProps>(({ visible, onClose, onShare, score, board }, ref) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card} ref={ref}>
          <Text style={styles.title}>Yeni Rekor! 🏆</Text>
          <Text style={styles.score}>Skor: {score}</Text>
          <View style={styles.boardGrid}>
            {board.map((row, i) => (
              <View key={i} style={styles.row}>
                {row.map((cell, j) => (
                  <View key={j} style={styles.cell}>
                    <Text style={styles.cellText}>{cell > 0 ? cell : ''}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          <Pressable style={styles.shareButton} onPress={onShare}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Instagram Story'de Paylaş</Text>
          </Pressable>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

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
    width: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eebbc3',
    marginBottom: 12,
  },
  score: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  boardGrid: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: '#eee4da',
    margin: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232946',
  },
  shareButton: {
    marginTop: 8,
    backgroundColor: '#00bfff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});

export default ScoreCardModal; 