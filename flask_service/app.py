# app.py
from flask import Flask, request, jsonify
from mqtt_handler import MQTTHandler

import config

app = Flask(__name__)

# Initialiser le gestionnaire MQTT
mqtt_handler = MQTTHandler(config.MQTT_BROKER, config.MQTT_PORT, config.MQTT_TOPIC)
mqtt_handler.connect()

@app.route('/publish', methods=['POST'])
def publish_data():
    try:
        data = request.json  # Récupérer les données du body de la requête
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Publier les données sur le sujet MQTT
        mqtt_handler.publish(config.MQTT_TOPIC, str(data))
        return jsonify({"success": True, "message": "Data published"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Service is running"}), 200

if __name__ == '__main__':
    app.run(debug=True)
