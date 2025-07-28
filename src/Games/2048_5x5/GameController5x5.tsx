import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { theme as themeObj } from '../../global/styles/theme';
import LinearGradient from 'react-native-linear-gradient';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

import {
  getEmptyBoard5x5,
  generateRandom5x5,
  moveLeft5x5,
  moveRight5x5,
  moveUp5x5,
  moveDown5x5,
  isOver5x5,
} from './GameBoard5x5';
import { Background } from '../../Components/Background';
import { useSwipe } from '../2048/useSwipe';
import MoveCounter from '../../Components/MoveCounter';
import UndoButton from '../../Components/UndoButton';
import Leaderboard from '../../Components/Leaderboard';

const width = Dimensions.get('window').width;
const BOARD_SIZE = 5;

// 2048 tarzı kutu renkleri
const cellColors: { [key: number]: string } = {
  2: '#e0f7fa',
  4: '#b2ebf2',
  8: '#80deea',
  16: '#4dd0e1',
  32: '#26c6da',
  64: '#00bcd4',
  128: '#00acc1',
  256: '#0097a7',
  512: '#00838f',
  1024: '#006064',
  2048: '#00e676',
};

const CARD_COLOR = '#232946';
const ACCENT = '#00bcd4'; // 5x5 için mavi ton
const BOARD_BG = 'rgba(0,188,212,0.10)';
const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
};
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GameController5x5: React.FC = () => {
  const [board, setBoard] = useState(generateRandom5x5(getEmptyBoard5x5()));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [polaroidVisible, setPolaroidVisible] = useState(false);
  const [history, setHistory] = useState<{ board: number[][]; score: number }[]>([]);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const scoreCardRef = React.useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();

  const [onTouchStart, onTouchEnd] = useSwipe(
    () => onSwipe('left'),
    () => onSwipe('right'),
    () => onSwipe('up'),
    () => onSwipe('down'),
  );

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedHighScore = await AsyncStorage.getItem('highScore5x5');
        if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));
      } catch {}
    };
    const loadScores = async () => {
      try {
        const stored = await AsyncStorage.getItem('scores5x5');
        if (stored) setScores(JSON.parse(stored));
      } catch {}
    };
    loadHighScore();
    loadScores();
  }, []);

  function onSwipe(direction: 'left' | 'right' | 'up' | 'down') {
    let moveFn = moveLeft5x5;
    if (direction === 'right') moveFn = moveRight5x5;
    if (direction === 'up') moveFn = moveUp5x5;
    if (direction === 'down') moveFn = moveDown5x5;
    const prevBoard = board.map(row => [...row]);
    const newBoard = moveFn(board);
    if (JSON.stringify(prevBoard) === JSON.stringify(newBoard[0])) return;
    setHistory(h => [...h, { board: prevBoard, score }]);
    setBoard(generateRandom5x5(newBoard[0]));
    setScore(prevScore => {
      const updated = prevScore + newBoard[1];
      if (updated > highScore) {
        setHighScore(updated);
        AsyncStorage.setItem('highScore5x5', updated.toString());
      }
      return updated;
    });
    setMoveCount(c => c + 1);
    checkEndGame(generateRandom5x5(newBoard[0]));
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last.board.map(row => [...row]));
    setScore(last.score);
    setHistory(h => h.slice(0, -1));
    setMoveCount(c => (c > 0 ? c - 1 : 0));
    setModalVisible(false);
  }

  function checkEndGame(currentBoard: number[][]) {
    if (isOver5x5(currentBoard)) {
      setModalVisible(true);
      // Skoru tabloya kaydet
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('scores5x5');
          const arr = stored ? JSON.parse(stored) : [];
          arr.push(score);
          await AsyncStorage.setItem('scores5x5', JSON.stringify(arr));
          setScores(arr);
        } catch {}
      })();
    }
  }

  const handleShareScoreCard = async () => {
    if (!scoreCardRef.current) return;
    try {
      const uri = await scoreCardRef.current.capture?.();
      if (uri) {
        await Share.open({ url: uri });
      }
    } catch {}
  };

  const shareApp = async () => {
    try {
      const url =
        'https://play.google.com/store/apps/details?id=com.darksor.colorful2048&hl=en';
      Share.open({
        message: 'Check out this amazing game on Google Play Store: ' + url,
      });
    } catch (error) {
      console.error('Error sharing app: ', error);
    }
  };

  const reset = () => {
    setBoard(generateRandom5x5(getEmptyBoard5x5()));
    setScore(0);
    setMoveCount(0);
    setHistory([]);
    setModalVisible(false);
  };
  
  return (
    <Background>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          {/* Başlık ve skor alanı */}
          <View style={styles.headerWrap}>
            <Text style={styles.title}>2048 - 5x5</Text>
            <Pressable style={styles.shareHeaderButton} onPress={() => setPolaroidVisible(true)}>
              <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
              <Text style={styles.shareHeaderText}>Sosyal Medyada Paylaş</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MoveCounter moves={moveCount} />
              <UndoButton onUndo={handleUndo} disabled={history.length === 0} />
            </View>
            <View style={styles.scoreRow}>
              <Animated.View style={[styles.scoreCard, SHADOW, { transform: [{ scale: 1 }], backgroundColor: '#fffbe6', borderColor: ACCENT, borderWidth: 2 }]}> 
                <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>SCORE</Text>
                <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{score}</Text>
              </Animated.View>
              <View style={[styles.scoreCard, SHADOW, { backgroundColor: ACCENT }]}> 
                <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>BEST</Text>
                <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{highScore}</Text>
              </View>
            </View>

            <View style={styles.topButtonRow}>
              <AnimatedPressable onPress={reset}  style={({ pressed }) => [styles.topActionButton, SHADOW, { transform: [{ scale: pressed ? 0.95 : 1 }] }] }>
                <Ionicons name="sync-outline" size={24} color={ACCENT} />
              </AnimatedPressable>
              <AnimatedPressable onPress={shareApp} style={({ pressed }) => [styles.topActionButton, SHADOW, { transform: [{ scale: pressed ? 0.95 : 1 }] }] }>
                <MaterialCommunityIcons name="share" size={24} color={ACCENT} />
              </AnimatedPressable>
            </View>
          </View>
          {/* Board alanı */}
          <View style={styles.boardWrap}>
            <LinearGradient
              colors={[themeObj.colors.secondary80, themeObj.colors.secondary100]}
             
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View
                style={styles.boardStyle}
                onStartShouldSetResponder={e => { onTouchStart(e); return true; }}
                onResponderRelease={onTouchEnd}
              >
                {board.map((row, rowIndex) => (
                  <View key={`cell-${rowIndex}`} style={styles.rowStyle}>
                    {row.map((value, cellIndex) => (
                      <View key={`cell-${cellIndex}`} style={[styles.cell5x5, { backgroundColor: cellColors[value > 2048 ? 2048 : value] || '#d6cdc4' }] }>
                        <Text style={[styles.cellText5x5, { color: value > 4 ? '#f8f5f0' : '#776e65' }]}>{value > 0 ? value : ''}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
          {/* Modal, Leaderboard, Polaroid */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <LinearGradient
                colors={[themeObj.colors.secondary80, themeObj.colors.secondary100]}
                style={styles.modalCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="trophy" size={64} color={ACCENT} style={{ marginBottom: 8, textAlign: 'center' }} />
                <Text style={styles.modalTitle}>Oyun Bitti!</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <View style={[styles.scoreCard, SHADOW, { backgroundColor: '#fffbe6', borderColor: ACCENT, borderWidth: 2, marginRight: 0, minWidth: 100 }]}> 
                    <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>SCORE</Text>
                    <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{score}</Text>
                  </View>
                  <View style={[styles.scoreCard, SHADOW, { backgroundColor: ACCENT, minWidth: 100 }]}> 
                    <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>BEST</Text>
                    <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{highScore}</Text>
                  </View>
                </View>
                <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
                  <Pressable style={[styles.modalButton, { width: '90%', marginBottom: 10 }]} onPress={() => setLeaderboardVisible(true)}>
                    <Text style={styles.modalButtonText}>Liderlik Tablosu</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, { width: '90%' }]} onPress={reset}>
                    <Text style={styles.modalButtonText}>Tekrar Oyna</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </Modal>
          <Leaderboard scores={scores} visible={leaderboardVisible} onClose={() => setLeaderboardVisible(false)} />
          {polaroidVisible && (
            <Modal visible={polaroidVisible} transparent animationType="fade">
              <View style={styles.scoreCardOverlay}>
                <ViewShot
                  ref={scoreCardRef}
                  options={{ format: 'png', quality: 0.98 }}
                  style={styles.polaroidShot}
                >
                  <LinearGradient
                    colors={[themeObj.colors.secondary80, themeObj.colors.secondary100]}
                    style={styles.polaroidCardModern}
                  >
                    <MaterialCommunityIcons name="trophy" size={64} color="#FFD700" style={{ marginBottom: 8, marginTop: 8 }} />
                    <Text style={[styles.polaroidBigTitle, { color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }]}>2048!</Text>
                    <View style={styles.polaroidRowWrap}>
                      <View style={[styles.polaroidInfoBox, { backgroundColor: '#fffbe6', borderColor: '#eebbc3' }] }>
                        <Text style={[styles.polaroidInfoLabel, { color: '#232946' }]}>Skor</Text>
                        <Text style={[styles.polaroidInfoValue, { color: '#232946' }]}>{score}</Text>
                      </View>
                      <View style={[styles.polaroidInfoBox, { backgroundColor: '#fffbe6', borderColor: '#eebbc3' }] }>
                        <Text style={[styles.polaroidInfoLabel, { color: '#232946' }]}>En İyi</Text>
                        <Text style={[styles.polaroidInfoValue, { color: '#232946' }]}>{highScore}</Text>
                      </View>
                      <View style={[styles.polaroidInfoBox, { backgroundColor: '#fffbe6', borderColor: '#eebbc3' }] }>
                        <Text style={[styles.polaroidInfoLabel, { color: '#232946' }]}>Hamle</Text>
                        <Text style={[styles.polaroidInfoValue, { color: '#232946' }]}>{moveCount}</Text>
                      </View>
                    </View>
                    <Text style={[styles.polaroidDate2, { color: '#fff', opacity: 0.8 }]}>{new Date().toLocaleDateString('tr-TR')}</Text>
                    <MaterialCommunityIcons name="party-popper" size={48} color="#FFD700" style={{ marginTop: 16, marginBottom: 8 }} />
                    <Text style={[styles.polaroidBrand2, { color: '#00bfff', marginTop: 18 }]}>DarkSor Company 2048</Text>
                  </LinearGradient>
                </ViewShot>
                <Pressable style={styles.scoreCardShareButton} onPress={handleShareScoreCard}>
                  <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
                  <Text style={styles.scoreCardShareText}>Sosyal Medyada Paylaş</Text>
                </Pressable>
                <Pressable style={styles.scoreCardCloseButton} onPress={() => setPolaroidVisible(false)}>
                  <Text style={styles.scoreCardCloseText}>Kapat</Text>
                </Pressable>
              </View>
            </Modal>
          )}
        </SafeAreaView>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  // ... modern ve responsive kutucuklar, board, polaroid ve modal stilleri ...
  headerWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  title: {
    fontSize: 54,
    fontWeight: 'bold',
    color: ACCENT,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  shareHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eebbc3',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  shareHeaderText: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  scoreCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  scoreLabel: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 0,
  },
  boardStyle: {
    width: width - 32,
    padding: 6,
    backgroundColor: BOARD_BG,
    borderRadius: 20,
    alignItems: 'center',
  },
  rowStyle: {
    flexDirection: 'row',
    height: (width - 32) / BOARD_SIZE,
    marginVertical: 0,
  },
  cell5x5: {
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#232946',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cellText5x5: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#232946',
  },
  topButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 8,
    gap: 8,
  },
  topActionButton: {
    backgroundColor: CARD_COLOR,
    borderRadius: 24,
    padding: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ... polaroid ve modal stilleri ...
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width * 0.8,
    ...SHADOW,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CARD_COLOR,
    marginBottom: 12,
  },
  modalScore: {
    fontSize: 20,
    color: '#232946',
    marginBottom: 8,
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: CARD_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  polaroidShot: {
    width: width * 0.8,
    height: width * 0.8 * 1.3, // Aspect ratio for polaroid
    borderRadius: 24,
    overflow: 'hidden',
  },
  polaroidCardModern: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroidBigTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  polaroidRowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  polaroidInfoBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: '30%',
    borderWidth: 1,
    borderColor: '#eebbc3',
  },
  polaroidInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  polaroidInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  polaroidDate2: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  polaroidBrand2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreCardShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  scoreCardShareText: {
    color: CARD_COLOR,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  scoreCardCloseButton: {
    marginTop: 16,
    backgroundColor: '#eebbc3',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  scoreCardCloseText: {
    color: CARD_COLOR,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default GameController5x5; 