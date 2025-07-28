export enum Screen {
  SplashScreen = 'SplashScreen',
  MainScreen = 'MainScreen',
  GameController = 'GameController',
  GameController5x5 = 'GameController5x5',
  GameController6x6= 'GameController6x6',
  GameController7x7= 'GameController7x7',
  GameController8x8= 'GameController8x8',
  // Diğer ekranlarınızı buraya ekleyin
}

export type RootStackParamList = {
  SplashScreen: undefined;
  MainScreen: undefined;
  GameController: undefined;
  GameController5x5: undefined;
  GameController6x6: undefined;
  GameController7x7: undefined;
  GameController8x8: undefined;
  // Diğer ekranlarınızı buraya ekleyebilirsiniz
}; 