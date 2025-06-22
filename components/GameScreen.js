import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';

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

  const gameLoop = useRef(null);
  const platformLoop = useRef(null); 
  const hasJumpedFromPlatform = useRef(false);
  const upDistanceRef = useRef(0);


  const moveLeft = () => {
    setJumperLeft((prev) => Math.max(prev - 10, 0));
  };

  const moveRight = () => {
    setJumperLeft((prev) => Math.min(prev + 10, screenWidth - PIG_WIDTH));
  };

  // Main jump/fall loop
  useEffect(() => {
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
          clearInterval(gameLoop.current);
          clearInterval(platformLoop.current);
          onGameOver();
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
  }, [isJumping, platforms, jumperLeft]);
  
  

 // Move platforms downward over time
 useEffect(() => {
    platformLoop.current = setInterval(() => {
      setPlatforms((prev) => {
        // Move existing platforms downward
        const moved = prev
          .map((plat) => ({
            ...plat,
            bottom: plat.bottom - PLATFORM_SPEED,
          }))
          .filter((plat) => plat.bottom > -PLATFORM_HEIGHT);
  
        const newPlatforms = [...moved];
  
        // Add new platforms if fewer than 6
       while (newPlatforms.length < 6) {
  const previousPlatform = newPlatforms[newPlatforms.length - 1];
  const maxGap = JUMP_HEIGHT - 10; // ensures reachable platforms
  const minGap = 40; // prevent overlapping

  const newBottom = previousPlatform
    ? previousPlatform.bottom + Math.max(
        minGap,
        Math.min(Math.random() * maxGap, maxGap)
      )
    : screenHeight + Math.random() * 60;

  newPlatforms.push({
    left: Math.random() * (screenWidth - PLATFORM_WIDTH),
    bottom: newBottom,
  });

  setScore((s) => s + 1);
}

  
        return newPlatforms;
      });
    }, 100);
  
    return () => clearInterval(platformLoop.current);
  }, []);
  
  

  // Win condition
  useEffect(() => {
    if (score >= WIN_SCORE) {
      clearInterval(gameLoop.current);
      clearInterval(platformLoop.current);
      onWin();
    }
  }, [score]);
  
  useEffect(() => {
    if (jumperBottom <= 0) {
      clearInterval(gameLoop.current);
      clearInterval(platformLoop.current);
      onGameOver();
    }
  }, [jumperBottom]);
  

  return (
    <View style={styles.container}>
      {/* Score Counter */}
      <Text style={styles.score}>{score}</Text>

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
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft} />
        <TouchableOpacity style={styles.controlButton} onPress={moveRight} />
      </View>
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    position: 'absolute',
    top: 50,
    left: 20,
    color: '#672f0e',
    fontFamily: 'MedievalSharp-Regular',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(103,48,14,0.8)',
    borderRadius: 30,
  },
});
