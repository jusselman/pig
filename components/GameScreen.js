import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import GameOverScreen from './GameOverScreen';
import GameAudio from './GameAudio';
import LifeBar from './LifeBar';

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
  const enemyX = useRef(new Animated.Value(screenWidth)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const [jumperLeft, setJumperLeft] = useState(screenWidth / 2 - PIG_WIDTH / 2);
  const [jumperBottom, setJumperBottom] = useState(150);
  const [isJumping, setIsJumping] = useState(false);
  const [facingLeft, setFacingLeft] = useState(true);
  const [platforms, setPlatforms] = useState(() =>
    Array.from({ length: 7 }, (_, i) => ({
      left: Math.random() * (screenWidth - PLATFORM_WIDTH),
      bottom: i * 120,
    }))
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showGameOver, setShowGameOver] = useState(false);
  const [hasGameOverPlayed, setHasGameOverPlayed] = useState(false);

  const gameLoop = useRef(null);
  const platformLoop = useRef(null);
  const hasJumpedFromPlatform = useRef(false);
  const upDistanceRef = useRef(0);
  const jumperBottomRef = useRef(jumperBottom);
  const jumperLeftRef = useRef(jumperLeft);

  // Update refs
  useEffect(() => {
    jumperBottomRef.current = jumperBottom;
  }, [jumperBottom]);

  useEffect(() => {
    jumperLeftRef.current = jumperLeft;
  }, [jumperLeft]);

  const pigRotation = useRef(new Animated.Value(0)).current;
  const pigRotationInterpolate = pigRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const triggerPigFlip = () => {
    pigRotation.setValue(0);
    Animated.timing(pigRotation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  };

  const pigFlashAnim = useRef(new Animated.Value(0)).current;
  const pigOverlayOpacity = pigFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });
  const lastHitTime = useRef(0);
  const triggerPigFlash = () => {
    pigFlashAnim.setValue(1);
    Animated.timing(pigFlashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const { playSound, stopSound, unloadAll } = GameAudio();

  // Animate clouds
  useEffect(() => {
    scrollX.setValue(0);
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -screenWidth,
        duration: 15000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Animate enemy bird
  useEffect(() => {
    let isCancelled = false;
  
    const animateEnemy = () => {
      if (isCancelled) return;
  
      enemyX.setValue(screenWidth);
      Animated.timing(enemyX, {
        toValue: -100,
        duration: 5000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start(() => {
        if (!isCancelled) animateEnemy(); // Loop again
      });
    };
  
    animateEnemy();
  
    return () => {
      isCancelled = true;
    };
  }, []);
  

  // Enemy collision detection
  useEffect(() => {
    if (showGameOver) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const pigLeft = jumperLeftRef.current;
      const pigBottom = jumperBottomRef.current;
      const pigRight = pigLeft + PIG_WIDTH;
      const pigTop = pigBottom + PIG_HEIGHT;

      const enemyLeft = enemyX.__getValue();
      const enemyTop = screenHeight / 2 - 30;
      const enemyRight = enemyLeft + 60;
      const enemyBottom = enemyTop + 60;

      const horizontal = pigRight > enemyLeft && pigLeft < enemyRight;
      const vertical = pigTop > enemyTop && pigBottom < enemyBottom;

      if (horizontal && vertical && now - lastHitTime.current > 1000) {
        lastHitTime.current = now;
        triggerPigFlash();
        playSound('squeal', require('../assets/audio/squeal.wav'));
        setLives((prev) => (prev > 1 ? prev - 1 : (handleGameOver(), 0)));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showGameOver]);

  // Jump + gravity loop
  useEffect(() => {
    if (showGameOver) return;

    gameLoop.current = setInterval(() => {
      setJumperBottom(prevBottom => {
        let newBottom = prevBottom;
    
        if (isJumping) {
          newBottom = prevBottom + 10;
          upDistanceRef.current += 10;
    
          if (upDistanceRef.current >= JUMP_HEIGHT) {
            setIsJumping(false);
            hasJumpedFromPlatform.current = false;
            upDistanceRef.current = 0;
          }
        } else {
          newBottom = prevBottom - GRAVITY;
        }
    
        // Pig hits ground
        if (newBottom <= 0) {
          handleGameOver();
          return 0;
        }
    
        return newBottom;
      });
    
      // Run platform collision check **outside** of setState
      if (!isJumping && !hasJumpedFromPlatform.current) {
        const currentBottom = jumperBottomRef.current;
        const currentLeft = jumperLeftRef.current;
    
        for (let plat of platforms) {
          const isAbove = currentBottom >= plat.bottom + PLATFORM_HEIGHT;
          const isLanding =
            currentBottom <= plat.bottom + PLATFORM_HEIGHT + 10 && // Increased threshold
            currentBottom >= plat.bottom - 10;                     //  Increased threshold
          const withinX =
            currentLeft + PIG_WIDTH > plat.left &&
            currentLeft < plat.left + PLATFORM_WIDTH;
        
          if (isAbove && isLanding && withinX) {
            setIsJumping(true);
            hasJumpedFromPlatform.current = true;
            setJumperBottom(plat.bottom + PLATFORM_HEIGHT);
            triggerPigFlip();
            break;
          }
        }}
        
    }, 30);    

    return () => clearInterval(gameLoop.current);
  }, [platforms, isJumping, jumperLeft, showGameOver]);

  // Platforms move down
  useEffect(() => {
    if (showGameOver) return;

    platformLoop.current = setInterval(() => {
      setPlatforms((prev) => {
        const moved = prev
          .map((p) => ({ ...p, bottom: p.bottom - PLATFORM_SPEED }))
          .filter((p) => p.bottom > -PLATFORM_HEIGHT);

        const removedCount = prev.length - moved.length;
        if (removedCount > 0) setScore((s) => s + removedCount);

        const newPlatforms = [...moved];
        while (newPlatforms.length < 7) {
          const topY = Math.max(...newPlatforms.map((p) => p.bottom), screenHeight * 0.8);
          newPlatforms.push({
            left: Math.random() * (screenWidth - PLATFORM_WIDTH),
            bottom: topY + 120,
          });
        }
        return newPlatforms;
      });
    }, 100);

    return () => clearInterval(platformLoop.current);
  }, [showGameOver]);

  const handleGameOver = async () => {
    if (hasGameOverPlayed) return;
    setHasGameOverPlayed(true);
    clearInterval(gameLoop.current);
    clearInterval(platformLoop.current);
    await stopSound('playingMusic');
    await playSound('gameOver', require('../assets/audio/gameOver.mp3'));
    setShowGameOver(true);
  };

  const handlePlayAgain = async () => {
    setHasGameOverPlayed(false);
    await stopSound('gameOver');
    await playSound('playingMusic', require('../assets/audio/playingMusic.mp3'), { loop: true });
    setShowGameOver(false);
    setScore(0);
    setLives(3);
    setJumperLeft(screenWidth / 2 - PIG_WIDTH / 2);
    setJumperBottom(150);
    setIsJumping(false);
    setPlatforms(Array.from({ length: 7 }, (_, i) => ({
      left: Math.random() * (screenWidth - PLATFORM_WIDTH),
      bottom: i * 120,
    })));
    hasJumpedFromPlatform.current = false;
    upDistanceRef.current = 0;
  };

  useEffect(() => {
    playSound('playingMusic', require('../assets/audio/playingMusic.mp3'), { loop: true });
    return () => unloadAll();
  }, []);

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
      {/* Background */}
      <Animated.Image
        source={require('../assets/img/skyBg.png')}
        style={{
          position: 'absolute',
          width: screenWidth * 10,
          height: screenHeight,
          transform: [{ translateX: scrollX }],
        }}
        resizeMode="repeat"
      />

      {/* Enemy */}
      <Animated.Image
        source={require('../assets/img/enemyBird.gif')}
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          top: screenHeight / 2 - 30,
          transform: [{ translateX: enemyX }],
          zIndex: 999,
        }}
      />

      {/* UI */}
      <Text style={styles.score}>{score}</Text>
      <LifeBar lives={lives} />

      {/* Platforms */}
      {platforms.map((plat, i) => (
        <View
          key={i}
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

      {/* Pig */}
      <Animated.View
        style={{
          position: 'absolute',
          left: jumperLeft,
          bottom: jumperBottom,
          width: PIG_WIDTH,
          height: PIG_HEIGHT,
          transform: [
            { rotate: pigRotationInterpolate },
            { scaleX: facingLeft ? 1 : -1 },
          ],
        }}
      >
        <Image
          source={require('../assets/img/waddles.png')}
          style={{ width: PIG_WIDTH, height: PIG_HEIGHT }}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: PIG_WIDTH,
            height: PIG_HEIGHT,
            backgroundColor: 'red',
            opacity: pigOverlayOpacity,
            borderRadius: 5,
          }}
        />
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setJumperLeft((prev) => Math.max(prev - 10, 0));
            setFacingLeft(true);
          }}
        />
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setJumperLeft((prev) => Math.min(prev + 10, screenWidth - PIG_WIDTH));
            setFacingLeft(false);
          }}
        />
      </View>

      {/* Game Over */}
      {showGameOver && <GameOverScreen score={score} onPlayAgain={handlePlayAgain} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ccf2ff' },
  score: { position: 'absolute', top: 30, left: 20, fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
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
});

export default GameScreen;



