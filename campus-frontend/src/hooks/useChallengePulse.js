import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = 'http://localhost:8080/ws';

export const useChallengePulse = (challengeId) => {
  const [pulseData, setPulseData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!challengeId) return;

    const socket = new SockJS(WEBSOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('WS Debug:', str),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        console.log('Connected to Peerly Pulse');

        // Subscribe to real-time vote updates for this specific challenge
        client.subscribe(`/topic/challenge/${challengeId}/votes`, (message) => {
          const data = JSON.parse(message.body);
          setPulseData(data);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('Disconnected from Peerly Pulse');
      },
    });

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [challengeId]);

  return { pulseData, isConnected };
};
