import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const VideoPlayer = ({ url }) => {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Preparing Arena Replay...</Text>
        </View>
      )}
      <Video
        ref={video}
        style={styles.video}
        source={{ uri: url }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(() => status)}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  video: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 0.5,
  }
});

export default VideoPlayer;
