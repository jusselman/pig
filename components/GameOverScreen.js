import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameOver = ({ score, onPlayAgain }) => {
  return (
    <View style={styles.overlay}>
      {/* Scroll background container */}
      <View style={styles.scrollContainer}>
        {/* Dead pig image */}
        <Image
          source={require('../assets/img/deadWaddles.png')} // Adjust path as needed
          style={styles.deadWaddles}
        />
        
        {/* Game over text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Lord Swineheart Has Fallen</Text>
          <Text style={styles.description}>
            Don't despair, Lord Swineheart will rise again,{'\n'}
            he is the only pig capable of bringing home the{'\n'}
            bacon and restoring order to the kingdom...
          </Text>
          
          {/* Score display */}
          <Text style={styles.scoreText}>Final Score: {score}</Text>
          
          {/* Play again button */}
          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Text style={styles.buttonText}>Pork Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scrollContainer: {
    width: Math.min(screenWidth * 0.9, 400),
    height: Math.min(screenHeight * 0.7, 500),
    backgroundColor: '#f4e4c1', // Scroll-like parchment color
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#8b4513',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.65,
    shadowRadius: 15,
    elevation: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  deadWaddles: {
    width: 100,
    height: 80,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#672f0e',
    fontFamily: 'MedievalSharp-Regular', // Make sure this font is loaded
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#672f0e',
    fontFamily: 'MedievalSharp-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#672f0e',
    fontFamily: 'MedievalSharp-Regular',
    marginBottom: 25,
  },
  playAgainButton: {
    backgroundColor: '#672f0e',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp-Regular',
    textAlign: 'center',
  },
});

export default GameOver;