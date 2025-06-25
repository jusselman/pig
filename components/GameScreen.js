import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import GameOverScreen from './GameOverScreen';
import GameAudio from './GameAudio'; // Custom hook

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PIG_WIDTH = 60;
const PIG_HEIGHT = 45;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 10;
const JUMP_HEIGHT = 150;
const GRAVITY = 4;
const PLATFORM_SPEED = 2;
const WIN_SCORE = 50;

const GameScreen = ({ onGameOver, onWin }) => {
  const [jumperLeft, setJumperLeft] = useState(screenWidth / 2 - PIG_WIDTH / 2);
  const [jumperBottom, setJumperBottom] = useState(150);
  const [isJumping, setIsJumping] = useState(false);
  const [platforms, setPlatforms] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      left: Math.random() * (screenWidth - PLATFORM_WIDTH),
      bottom: i * 120,
    }))
  );
  const [score, setScore] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);

  const gameLoop = useRef(null);
  const platformLoop = useRef(null);
  const hasJumpedFromPlatform = useRef(false);
  const upDistanceRef = useRef(0);

  const {
    playSound,
    stopSound,
    toggleMute,
    muted,
    unloadAll
  } = GameAudio();

  // Handle game over
  const handleGameOver = async () => {
    clearInterval(gameLoop.current);
    clearInterval(platformLoop.current);
    await stopSound("playingMusic"); // stop game music
    await playSound("gameOver", require("../assets/audio/gameOver.mp3")); // play once
    setShowGameOver(true);
  };
  

  // Handle play again
  const handlePlayAgain = async () => {
    await stopSound("gameOver"); // stop leftover game over music
    await playSound("playingMusic", require("../assets/audio/playingMusic.mp3"), { loop: true });
  
    // Reset game state
    setShowGameOver(false);
    setScore(0);
    setJumperLeft(screenWidth / 2 - PIG_WIDTH / 2);
    setJumperBottom(150);
    setIsJumping(false);
    setPlatforms(Array.from({ length: 6 }, (_, i) => ({
      left: Math.random() * (screenWidth - PLATFORM_WIDTH),
      bottom: i * 120,
    })));
    hasJumpedFromPlatform.current = false;
    upDistanceRef.current = 0;
  };
  

  // Start background music once at mount
  useEffect(() => {
    playSound('music', require('../assets/audio/playingMusic.mp3'), { isLooping: true });
    return () => unloadAll();
  }, []);

  useEffect(() => {
    return () => {
      unloadAll(); // stop & unload all sounds when GameScreen unmounts
    };
  }, []);
  

  // Main jump/fall loop
  useEffect(() => {
    if (showGameOver) return;

    gameLoop.current = setInterval(() => {
      setJumperBottom((prev) => {
        let newBottom = prev;

        if (isJumping) {
          newBottom = prev + 10;
          upDistanceRef.current += 10;

          if (upDistanceRef.current >= JUMP_HEIGHT) {
            setIsJumping(false);
            hasJumpedFromPlatform.current = false;
            upDistanceRef.current = 0;
          }
        } else {
          newBottom = prev - GRAVITY;
        }

        if (newBottom <= 0) {
          handleGameOver();
          return 0;
        }

        if (!isJumping && !hasJumpedFromPlatform.current) {
          platforms.forEach((plat) => {
            const isAbove = prev >= plat.bottom + PLATFORM_HEIGHT;
            const isLanding =
              newBottom <= plat.bottom + PLATFORM_HEIGHT &&
              newBottom >= plat.bottom - 5;
            const withinX =
              jumperLeft + PIG_WIDTH > plat.left &&
              jumperLeft < plat.left + PLATFORM_WIDTH;

            if (isAbove && isLanding && withinX) {
              playSound('squeal', require('../assets/audio/squeal.wav'));
              setIsJumping(true);
              hasJumpedFromPlatform.current = true;
              newBottom = plat.bottom + PLATFORM_HEIGHT;
            }
          });
        }

        return newBottom;
      });
    }, 30);

    return () => clearInterval(gameLoop.current);
  }, [isJumping, platforms, jumperLeft, showGameOver]);

  // Platform movement loop
  useEffect(() => {
    if (showGameOver) return;

    platformLoop.current = setInterval(() => {
      setPlatforms((prev) => {
        const moved = prev
          .map((plat) => ({ ...plat, bottom: plat.bottom - PLATFORM_SPEED }))
          .filter((plat) => plat.bottom > -PLATFORM_HEIGHT);

        const newPlatforms = [...moved];
        const removedCount = prev.length - moved.length;

        if (removedCount > 0) {
          setScore((s) => s + removedCount);
        }

        const platformsToAdd = 7 - newPlatforms.length;

        if (platformsToAdd > 0) {
          let topPlatformY = newPlatforms.length > 0
            ? Math.max(...newPlatforms.map((plat) => plat.bottom))
            : screenHeight * 0.8;

          for (let i = 0; i < platformsToAdd; i++) {
            newPlatforms.push({
              left: Math.random() * (screenWidth - PLATFORM_WIDTH),
              bottom: topPlatformY + ((i + 1) * 110),
            });
          }
        }

        return newPlatforms;
      });
    }, 100);

    return () => clearInterval(platformLoop.current);
  }, [showGameOver]);

  // Check for win condition
  useEffect(() => {
    if (score >= WIN_SCORE) {
      clearInterval(gameLoop.current);
      clearInterval(platformLoop.current);
      stopSound('music');
      playSound('win', require('../assets/audio/win.mp3'));
      playSound('pigWin', require('../assets/audio/pigWin.mp3'));
      onWin();
    }
  }, [score]);

  return (
    <View style={styles.container}>
      {/* Score Counter */}
      <Text style={styles.score}>{score}</Text>

      {/* Mute Toggle */}
      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Text style={{ color: 'white' }}>{muted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>

      {/* Platforms */}
      {platforms.map((plat, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: plat.left,
            bottom: plat.bottom,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            backgroundColor: '#5e2901',
            borderRadius: 5,
          }}
        />
      ))}

      {/* Jumper */}
      <Image
        source={require('../assets/img/waddles.png')}
        style={{
          position: 'absolute',
          left: jumperLeft,
          bottom: jumperBottom,
          width: PIG_WIDTH,
          height: PIG_HEIGHT,
        }}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => setJumperLeft(prev => Math.max(prev - 10, 0))} />
        <TouchableOpacity style={styles.controlButton} onPress={() => setJumperLeft(prev => Math.min(prev + 10, screenWidth - PIG_WIDTH))} />
      </View>

      {/* Game Over Overlay */}
      {showGameOver && (
        <GameOverScreen score={score} onPlayAgain={handlePlayAgain} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccf2ff',
  },
  score: {
    position: 'absolute',
    top: 30,
    left: 20,
    fontSize: 32,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 40,
  },
  muteButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 20,
  },
});

export default GameScreen;


