# mqtt_handler.py
import paho.mqtt.client as mqtt

class MQTTHandler:
    def __init__(self, broker, port, topic):
        self.client = mqtt.Client()
        self.broker = broker
        self.port = port
        self.topic = topic

    def connect(self):
        self.client.connect(self.broker, self.port)
        print(f"Connected to MQTT broker at {self.broker}:{self.port}")

    def publish(self, topic, message):
        self.client.publish(topic, message)
        print(f"Published message to {topic}: {message}")

    def subscribe(self, callback):
        def on_message(client, userdata, msg):
            callback(msg.topic, msg.payload.decode())
        
        self.client.on_message = on_message
        self.client.subscribe(self.topic)
        self.client.loop_start()
        print(f"Subscribed to topic: {self.topic}")
