// App.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

// Screens
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import WinScreen from './components/WinScreen';

// Load custom fonts
const loadFonts = () => {
  return Font.loadAsync({
    'MedievalSharp': require('./assets/fonts/MedievalSharp-Regular.ttf'),
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver', 'win'

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  const handleStart = () => setGameState('playing');
  const handleGameOver = () => setGameState('gameOver');
  const handleWin = () => setGameState('win');
  const handleRestart = () => setGameState('start');

  return (
    <View style={styles.container}>
      {gameState === 'start' && <StartScreen onStart={handleStart} />}
      {gameState === 'playing' && (
        <GameScreen onGameOver={handleGameOver} onWin={handleWin} />
      )}
      {gameState === 'gameOver' && <GameOverScreen onRestart={handleRestart} />}
      {gameState === 'win' && <WinScreen onRestart={handleRestart} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fallback background if no image is used
  },
});

