// App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import * as Audio from 'expo-av'; // <- Add this

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

const configureAudio = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [gameState, setGameState] = useState('start');

  useEffect(() => {
    configureAudio(); //Ensure audio is configured once at app load
  }, []);

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

