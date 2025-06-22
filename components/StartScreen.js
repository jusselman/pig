// components/StartScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const scrollImage = require('../assets/img/scroll.png'); 

export default function StartScreen({ onStart }) {
  return (
    <View style={styles.container}>
      <ImageBackground source={scrollImage} style={styles.scroll}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Pork Hoppin'</Text>
          <Text style={styles.description}>
            A dark scourge has overtaken the land of Sus Scrofia...{'\n\n'}
            Only one pig has the courage to step up. Help Prince Swineheart take back control of the Burger Kingdom from the evil forces and restore peace!
          </Text>

          <TouchableOpacity style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>Start Porkin'</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    width: width * 0.85,
    aspectRatio: 580 / 435, // matches original scroll image ratio
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 32,
    color: 'rgb(103, 48, 14)',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: 'rgb(103, 48, 14)',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'rgb(103, 48, 14)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#fff',
  },
});
