from fastapi import FastAPI, HTTPException
import requests
import json
import paho.mqtt.client as mqtt

app = FastAPI()

# Configuration de Mosquitto (MQTT)
MQTT_BROKER = 'localhost'
MQTT_PORT = 1883
MQTT_SUB_TOPIC = 'request_topic'  # Topic pour recevoir les requêtes
MQTT_PUB_TOPIC = 'data_topic'      # Topic pour envoyer les données

# Établir la connexion avec Mosquitto
def connect_mqtt():
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    return client

# Fonction de callback pour gérer la réception des messages
def on_message(client, userdata, message):
    user_id = message.payload.decode()
    print(f"Requête reçue pour user_id: {user_id}")
    data = get_data(user_id)
    client.publish(MQTT_PUB_TOPIC, json.dumps(data), qos=1)

# Fonction pour récupérer des données
def get_data(user_id: str):
    try:
        response = requests.get(f"https://api.example.com/data/{user_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Erreur lors de la récupération des données")
        
        data = response.json()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

# Configurer le client MQTT pour écouter les requêtes
mqtt_client = connect_mqtt()
mqtt_client.on_message = on_message
mqtt_client.subscribe(MQTT_SUB_TOPIC)

# Démarrer la boucle MQTT
mqtt_client.loop_start()

# Pour exécuter le serveur, utilisez la commande suivante dans le terminal:
# uvicorn nom_du_fichier:app --reload