// components/LifeBar.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LifeBar = ({ lives }) => {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Image
          key={i}
          source={
            i < lives
              ? require('../assets/img/heartFull.png')
              : require('../assets/img/heartEmpty.png')
          }
          style={styles.heart}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    right: 70,
    flexDirection: 'row',
    gap: 6, // or use marginRight in older React Native versions
  },
  heart: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default LifeBar;
