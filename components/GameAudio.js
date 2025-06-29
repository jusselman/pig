// components/GameAudio.js
import { useRef } from 'react';
import { Audio } from 'expo-av';

export default function useGameAudio() {
  const sounds = useRef({});
  const currentMusic = useRef(null); // Track music that should be unique (looping)

  const loadSound = async (name, file) => {
    if (!sounds.current[name]) {
      const { sound } = await Audio.Sound.createAsync(file);
      sounds.current[name] = sound;
    }
  };

  const playSound = async (name, file, { loop = false } = {}) => {
    // Prevent duplicate playbacks of music
    if (loop && currentMusic.current === name) return;

    await loadSound(name, file);
    const sound = sounds.current[name];

    if (loop) {
      // Stop any currently looping music before starting new one
      if (currentMusic.current && currentMusic.current !== name) {
        await stopSound(currentMusic.current);
      }
      currentMusic.current = name;
      await sound.setIsLoopingAsync(true);
    }

    try {
      if (!loop) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
    } catch (e) {
      console.warn(`Error playing sound "${name}":`, e);
    }
  };

  const stopSound = async (name) => {
    const sound = sounds.current[name];
    if (sound) {
      await sound.stopAsync();
      if (currentMusic.current === name) {
        currentMusic.current = null;
      }
    }
  };

  const stopAllSounds = async () => {
    for (const name in sounds.current) {
      const sound = sounds.current[name];
      if (sound) {
        await sound.stopAsync();
      }
    }
    currentMusic.current = null;
  };

  const unloadAll = async () => {
    for (const name in sounds.current) {
      const sound = sounds.current[name];
      if (sound) {
        await sound.unloadAsync();
      }
    }
    sounds.current = {};
    currentMusic.current = null;
  };

  return {
    playSound,
    stopSound,
    stopAllSounds,
    unloadAll,
  };
}
