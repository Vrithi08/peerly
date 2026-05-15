import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, Square, Music, RotateCcw } from 'lucide-react-native';

const AudioPlayer = ({ url }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playSound() {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function pauseSound() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.playerCard}>
        <View style={styles.iconCircle}>
          <Music size={32} color="#F97316" />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Audio Conquest</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        {isLoading ? (
          <ActivityIndicator color="#F97316" size="large" />
        ) : isPlaying ? (
          <TouchableOpacity style={styles.playBtn} onPress={pauseSound}>
            <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.playBtn} onPress={playSound}>
            <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.secondaryBtn} onPress={stopSound}>
          <Square size={20} color="#6B7280" fill="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#F97316',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AudioPlayer;
