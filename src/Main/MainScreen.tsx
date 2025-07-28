import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
  Switch,
  Pressable,
} from 'react-native';
import {Background} from '../Components/Background';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations/RootStackParamList';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const games: { id: string; name: string; root: 'GameController' | 'GameController5x5'; color: string }[] = [
  {id: '2', name: '4x4', root: 'GameController', color: '#00bfff'},
  {id: '3', name: '5x5', root: 'GameController5x5', color: '#00bfff'},
];

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [animations, setAnimations] = useState(true);
  const [sound, setSound] = useState(true);
  const [boardSize, setBoardSize] = useState(4);

  const renderGameItem = ({ item }: { item: { id: string; name: string; root: keyof RootStackParamList; color: string } }) => (
    <TouchableOpacity
      style={[styles.gameItem, {backgroundColor: item.color}]}
      onPress={() => navigation.navigate(item.root as any, { theme, animations })}
    >
      <Text style={styles.gameItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>2048 Colorful 2</Text>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: '#ddd',
            width: '100%',
            marginVertical: 0,
          }}
        />
        <Text style={styles.title2}>Select Mode 🎮</Text>
        <FlatList
          data={games}
          keyExtractor={item => item.id}
          renderItem={renderGameItem}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
        <Pressable style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Ayarlar ⚙️</Text>
        </Pressable>
        <Modal visible={settingsVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ayarlar</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Tema</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable onPress={() => setTheme('light')} style={[styles.themeOption, theme === 'light' && styles.themeSelected]}> 
                    <Text style={{ color: theme === 'light' ? '#fff' : '#000' }}>Açık</Text>
                  </Pressable>
                  <Pressable onPress={() => setTheme('dark')} style={[styles.themeOption, theme === 'dark' && styles.themeSelected]}> 
                    <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Koyu</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Animasyonlar</Text>
                <Switch value={animations} onValueChange={setAnimations} />
              </View>
              <Pressable style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kapat</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#3498db',
    width: width*0.95,
    borderRadius:10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  title2: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#fff',
  },
  list: {
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  gameItem: {
    backgroundColor: '#3498db',
    width: width * 0.8,
    height: height * 0.085,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 3, // veya shadow kullanabilirsiniz
    marginBottom: 15,
  },
  gameItemText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 5,
  },
  settingsButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#232946',
    borderRadius: 20,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeOption: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  themeSelected: {
    backgroundColor: '#3498db',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});

export default MainScreen;
