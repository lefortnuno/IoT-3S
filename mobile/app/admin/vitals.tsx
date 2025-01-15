import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Client, Message } from 'react-native-mqtt';
import { connect, MqttClient } from '@taoqf/react-native-mqtt';

export default function Vitals() {
  const [message, setMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  let client: MqttClient | null = null;

  useEffect(() => {
    client = connect('mqtt://localhost:1883'); 

    client.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to MQTT broker');
      client?.subscribe('health/vitals', (err: Error) => {
        if (!err) {
          console.log('Subscribed to health/vitals');
        }
      });
    });

    client.on('message', (topic: string, payload: Buffer) => {
      console.log(`Message received from ${topic}: ${payload.toString()}`);
      setMessage(payload.toString());
    });

    client.on('error', (err: Error) => {
      console.error('Connection error:', err);
    });

    return () => {
      client?.end();
    };
  }, []);

  const sendMessage = () => {
    if (client) {
      client.publish('health/vitals', 'Hello from React Native');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>MQTT Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      <Text>Last Message: {message}</Text>
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
}
