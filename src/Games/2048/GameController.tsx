import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme as themeObj } from '../../global/styles/theme';

import {
  generateRandom,
  getEmptyBoard,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  isOver,
} from './GameBoard';
import Cell from './Cell';
import { useSwipe } from './useSwipe';
import { Background } from '../../Components/Background';
import MoveCounter from '../../Components/MoveCounter';
import UndoButton from '../../Components/UndoButton';
import Leaderboard from '../../Components/Leaderboard';
import ScoreCardModal from '../../Components/ScoreCardModal';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const CARD_COLOR = '#232946';
const ACCENT = '#eebbc3';
const BOARD_BG = 'rgba(255,255,255,0.12)';
const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
};

type GameControllerRouteProp = RouteProp<{
  GameController: { theme: 'light' | 'dark'; animations: boolean };
}, 'GameController'>;

const GameController: React.FC = () => {
  const route = useRoute<GameControllerRouteProp>();
  const theme = route.params?.theme || 'light';
  const animationsEnabled = route.params?.animations !== false;
  // Board boyutu her zaman 4x4
  function getEmptyBoardDynamic() {
    return Array(4).fill(0).map(() => Array(4).fill(0));
  }
  function generateRandomDynamic(board: number[][]) {
    const isFull = !board.some(row => row.includes(0));
    if (isFull) return board;
    const newBoard = board.map(row => [...row]);
    let row = Math.floor(Math.random() * 4);
    let col = Math.floor(Math.random() * 4);
    while (newBoard[row][col] !== 0) {
      row = Math.floor(Math.random() * 4);
      col = Math.floor(Math.random() * 4);
    }
    newBoard[row][col] = 2;
    return newBoard;
  }
  const [board, setBoard] = useState(generateRandomDynamic(getEmptyBoardDynamic()));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState(false);
  const [fireworksCount, setFireworksCount] = useState(0);
  const [gameOverModal, setGameOverModal] = useState(false);
  const [scoreAnim] = useState(new Animated.Value(1));
  // const [cellAnims, setCellAnims] = useState(
  //   Array(4)
  //     .fill(null)
  //     .map(() => Array(4).fill(new Animated.Value(1)))
  // );
  const [modalAnim] = useState(new Animated.Value(0));
  const [initialHighScore, setInitialHighScore] = useState(0);
  // const [showNewBest, setShowNewBest] = useState(false);
  // const [newBestAnim] = useState(new Animated.Value(0));
  const [mergedCells, setMergedCells] = useState<{ [key: string]: boolean }>({});
  const [shakeAnim] = useState(new Animated.Value(0));
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<{ board: number[][]; score: number }[]>([]);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [scoreCardVisible, setScoreCardVisible] = useState(false);
  const scoreCardRef = React.useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();
  const [polaroidVisible, setPolaroidVisible] = useState(false);

  const [onTouchStart, onTouchEnd] = useSwipe(
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  );

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedHighScore = await AsyncStorage.getItem('highScore');
        if (storedHighScore) {
          const parsed = parseInt(storedHighScore, 10);
          setHighScore(parsed);
          setInitialHighScore(parsed);
        }
      } catch (error) {
        console.error('Error loading high score: ', error);
      }
    };
    loadHighScore();
  }, []);

  // Skorlar listesini yükle
  useEffect(() => {
    const loadScores = async () => {
      try {
        const stored = await AsyncStorage.getItem('scores');
        if (stored) setScores(JSON.parse(stored));
      } catch {}
    };
    loadScores();
  }, []);

  // Oyun bittiğinde skoru kaydet
  useEffect(() => {
    if (gameOverModal) {
      const saveScore = async () => {
        try {
          const stored = await AsyncStorage.getItem('scores');
          const arr = stored ? JSON.parse(stored) : [];
          arr.push(score);
          await AsyncStorage.setItem('scores', JSON.stringify(arr));
          setScores(arr);
        } catch {}
      };
      saveScore();
    }
  }, [gameOverModal]);

  // Oyun bittiğinde ve yeni rekor ise skor kartı modalı aç
  useEffect(() => {
    if (gameOverModal && score > highScore) {
      setScoreCardVisible(true);
    }
  }, [gameOverModal]);

  // Skor kartı paylaşım fonksiyonu
  const handleShareScoreCard = async () => {
    if (!scoreCardRef.current) return;
    try {
      const uri = await scoreCardRef.current.capture?.();
      if (uri) {
        await Share.open({ url: uri });
      }
    } catch {}
  };

  // Animasyon fonksiyonlarında kontrol
  function animateScore() {
    if (!animationsEnabled) return;
    Animated.sequence([
      Animated.timing(scoreAnim, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // function triggerNewBest() { // kaldırıldı
  //   setShowNewBest(true);
  //   Animated.timing(newBestAnim, {
  //     toValue: 1,
  //     duration: 400,
  //     useNativeDriver: true,
  //   }).start(() => {
  //     setTimeout(() => {
  //       Animated.timing(newBestAnim, {
  //         toValue: 0,
  //         duration: 400,
  //         useNativeDriver: true,
  //       }).start(() => setShowNewBest(false));
  //     }, 2000);
  //   });
  // }

  const checkEndGame = () => {
    const gameOver = isOver(board);
    if (gameOver && score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScore', score.toString());
    }
    if (gameOver) {
      if (score >= 2048) {
        setShowFireworks(true);
        setShowBackgroundOverlay(true);
        setFireworksCount(prevCount => prevCount + 1);
        // setTimeout ve reset kaldırıldı
      } else {
        setGameOverModal(true);
      }
    }
  };

  function getMergedCells(prev: number[][], next: number[][]): { [key: string]: boolean } {
    const merged: { [key: string]: boolean } = {};
    const size = prev.length;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (next[i][j] > 0 && next[i][j] !== prev[i][j] && prev[i][j] !== 0) {
          merged[`${i},${j}`] = true;
        }
      }
    }
    return merged;
  }

  function shakeBoard() {
    if (!animationsEnabled) return;
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function onSwipe(direction: 'left' | 'right' | 'up' | 'down') {
    let moveFn = moveLeft;
    if (direction === 'right') moveFn = moveRight;
    if (direction === 'up') moveFn = moveUp;
    if (direction === 'down') moveFn = moveDown;
    const prevBoard = board.map(row => [...row]);
    const newBoard = moveFn(board);
    const merged = getMergedCells(prevBoard, newBoard[0]);
    setMergedCells(merged);
    if (JSON.stringify(prevBoard) === JSON.stringify(newBoard[0])) {
      shakeBoard();
      setLastAction(null);
      return;
    }
    // Hamle geçmişini kaydet
    setHistory(h => [...h, { board: prevBoard, score }]);
    setBoard(generateRandomDynamic(newBoard[0]));
    setScore(prevScore => {
      const updated = prevScore + newBoard[1];
      if (updated > highScore) {
        setHighScore(updated);
        AsyncStorage.setItem('highScore', updated.toString());
      }
      if (newBoard[1] > 0) animateScore();
      return updated;
    });
    setMoveCount(c => c + 1);
    checkEndGame();
    setLastAction(direction === 'left' ? 'long-arrow-left' : direction === 'right' ? 'long-arrow-right' : direction === 'up' ? 'long-arrow-up' : 'long-arrow-down');
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last.board.map(row => [...row]));
    setScore(last.score);
    setHistory(h => h.slice(0, -1));
    setMoveCount(c => (c > 0 ? c - 1 : 0));
    setGameOverModal(false);
    setShowFireworks(false);
    setShowBackgroundOverlay(false);
  }

  function onSwipeLeft() { onSwipe('left'); }
  function onSwipeRight() { onSwipe('right'); }
  function onSwipeUp() { onSwipe('up'); }
  function onSwipeDown() { onSwipe('down'); }

  // reset fonksiyonunda da dinamik board kullan
  const reset = () => {
    setBoard(generateRandomDynamic(getEmptyBoardDynamic()));
    setScore(0);
    setLastAction(null);
    setGameOverModal(false);
    setShowFireworks(false);
    setShowBackgroundOverlay(false);
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

  // Test için board'u dolduran fonksiyon
  function fillBoardForTest() {
    const filled = Array(4).fill(0).map((_, i) =>
      Array(4).fill(0).map((_, j) => 2 ** ((i * 4 + j) % 11 + 1))
    );
    setBoard(filled);
    setScore(9999);
    setMoveCount(99);
    setTimeout(() => {
      checkEndGame(); // Board doldurulduktan sonra oyun bitişini kontrol et
    }, 100); // State güncellensin diye küçük bir gecikme bırak
  }

  // Modal animasyonu
  useEffect(() => {
    if (gameOverModal) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [gameOverModal]);

  // Background bileşenine theme prop'u ilet
  return (
    <Background theme={theme}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Oyun ekranı ViewShot ile sarmalanmasın. Sadece 'Sosyal Medyada Paylaş' butonuna tıklanınca açılan bir modalda polaroid kart ViewShot ile görünsün. Polaroid kartın arka planı, tema ile uyumlu gradient veya renk olsun. Paylaşım bu modal üzerinden yapılsın. */}
        <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          {/* Başlık ve skor alanı */}
          <View style={styles.headerWrap}>
            <Text style={styles.title}>2048</Text>
            {/* Sosyal Medyada Paylaş butonu başlığın hemen altında */}
            {showFireworks && (
              <Pressable style={styles.shareHeaderButton} onPress={() => setPolaroidVisible(true)}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
                <Text style={styles.shareHeaderText}>Sosyal Medyada Paylaş</Text>
              </Pressable>
            )}
            {/* Test butonu: Boardu doldur */}
            <Pressable style={[styles.topActionButton, { marginBottom: 8 }]} onPress={fillBoardForTest}>
              <Text style={{ color: ACCENT, fontWeight: 'bold' }}>Boardu Doldur (Test)</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MoveCounter moves={moveCount} />
              <UndoButton onUndo={handleUndo} disabled={history.length === 0} />
            </View>
            <View style={styles.scoreRow}>
              <Animated.View style={[styles.scoreCard, SHADOW, { transform: [{ scale: scoreAnim }], backgroundColor: '#fffbe6', borderColor: ACCENT, borderWidth: 2 }]}> 
                <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>SCORE</Text>
                <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{score}</Text>
              </Animated.View>
              <View style={[styles.scoreCard, SHADOW, { backgroundColor: ACCENT }]}> 
                <Text style={[styles.scoreLabel, { color: CARD_COLOR }]}>BEST</Text>
                <Text style={[styles.scoreValue, { color: CARD_COLOR }]}>{highScore}</Text>
              </View>
            </View>
            {/* Butonlar board üstünde sağa hizalı */}
            <View style={styles.topButtonRow}>
              <AnimatedPressable onPress={reset} style={({ pressed }) => [styles.topActionButton, SHADOW, { transform: [{ scale: pressed ? 0.95 : 1 }] }] }>
                <Ionicons name="sync-outline" size={24} color={ACCENT} />
              </AnimatedPressable>
              <AnimatedPressable onPress={shareApp} style={({ pressed }) => [styles.topActionButton, SHADOW, { transform: [{ scale: pressed ? 0.95 : 1 }] }] }>
                <MaterialCommunityIcons name="share" size={24} color={ACCENT} />
              </AnimatedPressable>
            </View>
          </View>
          {/* Board alanı */}
          <Animated.View
            onStartShouldSetResponder={(e) => { onTouchStart(e); return true; }}
            onResponderRelease={onTouchEnd}
            style={[styles.boardWrap, { transform: [{ translateX: shakeAnim }] }]}
          >
            <View style={styles.boardStyle}>
              {board.map((row, rowIndex) => (
                <View key={`cell-row-${rowIndex}`} style={styles.rowStyle}>
                  {row.map((value, cellIndex) => (
                    <Cell key={`cell-${cellIndex}`} value={value} merged={!!mergedCells[`${rowIndex},${cellIndex}`]} animationsEnabled={animationsEnabled} />
                  ))}
                </View>
              ))}
            </View>
            {showBackgroundOverlay && <View style={styles.overlay} />}
            {showFireworks && (
              <LottieView
                source={require('../../assets/karabuk/fireworks.json')}
                autoPlay
                loop={true}
                style={styles.fireworksAnimation}
              />
            )}
          </Animated.View>
          {/* Oyun Sonu Modalı */}
          
          {gameOverModal && (
            <Animated.View style={[styles.modalWrap, { opacity: modalAnim }] }>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Oyun Bitti!</Text>
                <Text style={styles.modalScore}>Skor: {score}</Text>
                <Text style={styles.modalScore}>En İyi: {highScore}</Text>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <Pressable style={[styles.modalButton, { marginRight: 8 }]} onPress={() => {/* Skor kartı paylaşımı eklenecek */}}>
                    <Text style={styles.modalButtonText}>Skor Kartını Paylaş</Text>
                  </Pressable>
                  <Pressable style={styles.modalButton} onPress={() => setLeaderboardVisible(true)}>
                    <Text style={styles.modalButtonText}>Liderlik Tablosu</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.modalButton} onPress={reset}>
                  <Text style={styles.modalButtonText}>Tekrar Oyna</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
          <Leaderboard scores={scores} visible={leaderboardVisible} onClose={() => setLeaderboardVisible(false)} />
        </SafeAreaView>
        {/* Polaroid modalı: */}
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
      </View>
    </Background>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  headerWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
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
    marginVertical: 10,
  },
  boardStyle: {
    width: width - 32,
    padding: 8,
    backgroundColor: BOARD_BG,
    borderRadius: 24,
    ...SHADOW,
  },
  rowStyle: {
    flexDirection: 'row',
    height: (width - 32) / 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 2,
  },
  fireworksAnimation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  buttonRow: {
    display: 'none', // Alt buton satırını gizle
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    backgroundColor: CARD_COLOR,
    minWidth: 140,
    justifyContent: 'center',
  },
  buttonText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalWrap: {
    ...StyleSheet.absoluteFillObject,
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
  // newBestWrap ve newBestText de kaldırılabilir
  shareFireworksButton: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eebbc3',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  shareFireworksText: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  shareFloatingButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#eebbc3',
    borderRadius: 20,
    padding: 10,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  scoreCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCardShot: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  scoreCardGradientBorder: {
    padding: 4,
    borderRadius: 36,
    backgroundColor: 'linear-gradient(90deg, #eebbc3 0%, #00bfff 100%)', // fallback
    // Gradient için LinearGradient ile sarmalanabilir, burada düz renk
    borderWidth: 4,
    borderColor: '#eebbc3',
    shadowColor: '#00bfff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  scoreCardModern: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  scoreCardModern2: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  scoreCardBigTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#232946',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: '#eebbc3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scoreCardRowWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  scoreCardInfoBox: {
    backgroundColor: '#eebbc3',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  scoreCardInfoLabel: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  scoreCardInfoValue: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scoreCardDate: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  scoreCardDate2: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
    marginTop: 2,
  },
  scoreCardBoardWrap: {
    marginVertical: 16,
    backgroundColor: '#eebbc3',
    borderRadius: 16,
    padding: 8,
  },
  scoreCardBoardWrap2: {
    marginVertical: 12,
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderColor: '#eebbc3',
  },
  scoreCardBoardRow: {
    flexDirection: 'row',
  },
  scoreCardBoardRow2: {
    flexDirection: 'row',
  },
  scoreCardCell: {
    width: 36,
    height: 36,
    backgroundColor: '#fffbe6',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCardCell2: {
    width: 38,
    height: 38,
    backgroundColor: '#eebbc3',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#232946',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreCardCellText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232946',
  },
  scoreCardCellText2: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232946',
  },
  scoreCardBrand: {
    marginTop: 10,
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  scoreCardBrand2: {
    marginTop: 12,
    color: '#00bfff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
    textShadowColor: '#eebbc3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  scoreCardShareButton: {
    marginTop: 18,
    backgroundColor: '#00bfff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  scoreCardShareText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  scoreCardCloseButton: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  scoreCardCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  polaroidOuter: {
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroidCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    width: 370,
    minHeight: 540,
  },
  polaroidInner: {
    width: '100%',
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  polaroidFooter: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  polaroidDate: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  polaroidBrand: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 2,
  },
  polaroidShot: {
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: theme ile ayarlanıyor
  },
  polaroidGradientBorder: {
    borderRadius: 32,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00bfff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
  },
  polaroidCardModern: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: 340,
    minHeight: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  polaroidBigTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#232946',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: '#eebbc3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  polaroidRowWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  polaroidInfoBox: {
    backgroundColor: 'rgba(0,191,255,0.12)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#eebbc3',
  },
  polaroidInfoLabel: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  polaroidInfoValue: {
    color: '#232946',
    fontWeight: 'bold',
    fontSize: 18,
  },
  polaroidDate2: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
    marginTop: 2,
  },
  polaroidBoardGlass: {
    marginVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderColor: '#eebbc3',
    shadowColor: '#00bfff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  polaroidBoardRow: {
    flexDirection: 'row',
  },
  polaroidCellGlass: {
    width: 38,
    height: 38,
    backgroundColor: '#eebbc3',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#232946',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  polaroidCellTextGlass: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232946',
  },
  polaroidBrand2: {
    marginTop: 12,
    color: '#00bfff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
    textShadowColor: '#eebbc3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export default GameController; 