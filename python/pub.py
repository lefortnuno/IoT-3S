import paho.mqtt.client as mqtt
import requests
import time
import json

# Configuration du broker MQTT
broker = "localhost"  # Adresse IP de votre broker MQTT
port = 1883
topic = "health/vitals"

# Connexion au broker
client = mqtt.Client()
client.connect(broker, port)

# Variables pour les statistiques
temperature_values = []
heart_rate_values = []
pression_values = []

# Fonction pour calculer les statistiques
def calculate_statistics(values):
    # Filtrer les valeurs None avant le calcul
    filtered_values = [v for v in values if v is not None]
    if not filtered_values:
        return None, None, None
    return sum(filtered_values) / len(filtered_values), max(filtered_values), min(filtered_values)

# Fonction pour récupérer et publier les données depuis l'URL
def fetch_and_publish(url):
    try:
        # Effectuer une requête GET à l'URL
        response = requests.get(url)
        response.raise_for_status()  # Vérifier si la requête a réussi
        data = response.json()  # Récupérer les données JSON

        # Parcourir les données reçues
        for entry in data:
            try:
                temperature = entry["temperature"]
                heart_rate = entry["heart_rate"]
                pression = entry.get("pression")  # Utiliser .get pour éviter KeyError

                # Ajouter les valeurs aux listes pour les statistiques
                temperature_values.append(temperature)
                heart_rate_values.append(heart_rate)
                pression_values.append(pression)

                # Détection des anomalies
                anomalies = []
                if temperature > 39.0:
                    anomalies.append(f"Anomalie: Température élevée ({temperature} °C)")
                if heart_rate > 120:
                    anomalies.append(f"Anomalie: Fréquence cardiaque élevée ({heart_rate} bpm)")
                if pression is not None and pression < 90:
                    anomalies.append(f"Anomalie: Saturation en oxygène basse ({pression} %)")

                # Afficher les anomalies
                if anomalies:
                    for anomaly in anomalies:
                        print(anomaly)

                # Construire un message JSON
                message = {
                    "temperature": temperature,
                    "heart_rate": heart_rate,
                    "pression": pression,
                    "anomalies": anomalies
                }

                # Publier les données sur MQTT
                client.publish(topic, json.dumps(message))
                print(f"Published: {message}")
                time.sleep(2)  # Attendre avant d'envoyer le prochain message

            except Exception as e:
                print(f"Erreur lors du traitement de l'entrée : {entry}")
                print(f"Détails de l'erreur : {e}")

        # Calcul des statistiques après avoir traité les données
        print("\nStatistiques :")
        temp_avg, temp_max, temp_min = calculate_statistics(temperature_values)
        hr_avg, hr_max, hr_min = calculate_statistics(heart_rate_values)
        pression_avg, pression_max, pression_min = calculate_statistics(pression_values)

        print(f"Température - Moyenne : {temp_avg:.2f} °C, Max : {temp_max:.2f} °C, Min : {temp_min:.2f} °C")
        print(f"Fréquence cardiaque - Moyenne : {hr_avg:.2f} bpm, Max : {hr_max:.2f} bpm, Min : {hr_min:.2f} bpm")
        print(f"Saturation SpO₂ - Moyenne : {pression_avg:.2f} %, Max : {pression_max:.2f} %, Min : {pression_min:.2f} %")

    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération des données : {e}")

# URL contenant les données JSON
url = "https://iot-3s.onrender.com/api/simulation/"

# Lancer la récupération et la publication
fetch_and_publish(url)