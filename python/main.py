import paho.mqtt.client as mqtt
import requests
import time
import json
from datetime import datetime, timedelta
 
broker = "localhost"   
port = 1883
topic = "health/vitals"
topicUser = "health/vitals/user"
topicStat = "health/vitals/stats" 
requestUserTopic = "health/vitals/user/request"
 
client = mqtt.Client()
client.connect(broker, port)
 
id_user = 1
id_user_tmp = id_user
# url = "https://iot-3s.onrender.com/api/simulation/" 
url = "http://192.168.1.10:5111/api/simulation/" 
 
from datetime import datetime

def fetch_and_publish_user(url, api_name, id):
    uri = f"{url}{api_name}{id}"
    try: 
        response = requests.get(uri)   
        response.raise_for_status()  
        data = response.json()[0]
         
        sexe = "Masculin" if data.get("sexe") == 1 else "Féminin"
        sante = "En bonne santé" if data.get("sante") == 1 else "Malade" 

        date_naiss_str = data.get("date_naiss")
        if date_naiss_str:
            try: 
                birth_year = int(date_naiss_str.split("-")[0]) 
                age = datetime.now().year - birth_year
                date_naiss_str = f"{age} ans"
            except (ValueError, IndexError):
                date_naiss_str = "Date invalide"
        else:
            date_naiss_str = "Non spécifié"
 
        message = {
            "u_id": data.get("u_id"),
            "nom": data.get("nom"),
            "prenom": data.get("prenom"),
            "date_naiss": date_naiss_str,
            "sexe": sexe,
            "adress": data.get("adress"),
            "email": data.get("email"),
            "sante": sante,
            "libelle": data.get("libelle"),
            "spec": data.get("spec"),
        }
 
        client.publish(topicUser, json.dumps(message))
        # print(f" \nUSER Published! {message}\n")  

    except requests.exceptions.RequestException as e:
        print(f"USER Erreur lors de la récupération des données : {e}")


# Callback pour gérer les messages reçus
def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        # print(f"Message reçu sur le topic {msg.topic}: {payload}")
        
        # Vérification que le message contient un ID valide
        id_user = int(payload)
        if id_user > 0:
            # print(f"Relancer fetch_and_publish_user avec id_user={id_user}")
            fetch_and_publish_user(url, "user/", id_user)
            
            date_today = datetime.now().strftime("%Y-%m-%d")
            date_yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            dataToday = fetch_statistics(url, "stat/", id_user, date_today) 
            dataYesterday = fetch_statistics(url, "stat/", id_user, date_yesterday) 
            publish_statistics(dataYesterday, dataToday, topicStat)
            # fetch_and_publish_simulation(url, "vitals/", id_user)

        else:
            print(f"ID utilisateur invalide: {id_user}")
    except ValueError:
        print(f"Erreur de parsing de l'ID utilisateur: {msg.payload}")


def fetch_statistics(url, api_name, id, date):
    uri = f"{url}{api_name}{id}"
    try:
        payload = {
            "date": date
        }
        response = requests.get(uri, params=payload)
        response.raise_for_status()  
        data = response.json()[0]
        
        # Vérifier si la valeur existe et n'est pas None avant conversion
        def safe_float(value):
            return round(float(value), 2) if value is not None else None

        message = {
            "max_t": safe_float(data.get("max_t")),
            "max_h": safe_float(data.get("max_h")),
            "max_p": safe_float(data.get("max_p")),
            "min_t": safe_float(data.get("min_t")),
            "min_h": safe_float(data.get("min_h")),
            "min_p": safe_float(data.get("min_p")),
            "avg_t": safe_float(data.get("avg_t")),
            "avg_h": safe_float(data.get("avg_h")),
            "avg_p": safe_float(data.get("avg_p")),
        }

        anomalies = []
        if message["avg_t"] is not None and message["avg_t"] > 39.0:
            anomalies.append(f"Anomalie: Température élevée ({message['avg_t']} °C)")
        if message["avg_h"] is not None and message["avg_h"] > 120:
            anomalies.append(f"Anomalie: Fréquence cardiaque élevée ({message['avg_h']} bpm)")
        if message["avg_p"] is not None and message["avg_p"] < 90:
            anomalies.append(f"Anomalie: Pression basse ({message['avg_p']} %)")

        message["anomalies"] = anomalies
        return message

    except requests.exceptions.RequestException as e:
        print(f"STAT Erreur lors de la récupération des données : {e}")


def publish_statistics(dataYesterday, dataToday, topicStats):
    message = [
                {
                    "name": "Témperature (°C)",
                    "hier": dataYesterday.get("avg_t"),
                    "today": dataToday.get("avg_t")
                },
                {
                    "name": "Heart rate (bpm)",
                    "hier": dataYesterday.get("avg_h"),
                    "today": dataToday.get("avg_h")
                },
                {
                    "name": "Taux d'oxygène (%)",
                    "hier": dataYesterday.get("avg_p"),
                    "today": dataToday.get("avg_p")
                }
            ] 

    client.publish(topicStats, json.dumps(message))
    # print(f"STAT Published! {message}\n")


def fetch_and_publish_simulation(url, api_name, id):
    uri = f"{url}{api_name}{id}"
    try: 
        payload = {
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        response = requests.get(uri, params=payload)
        response.raise_for_status()  
        data = response.json() 
        
        for entry in data:
            message = { 
                "temperature": round(float(entry.get("temperature", 0)), 2),
                "heart_rate":  entry.get("heart_rate"),
                "pression":  entry.get("pression") , 
            }

            anomalies = []
            if message["temperature"] and message["temperature"] > 39.0:
                anomalies.append(f"Anomalie: Température élevée ({message['temperature']} °C)")
            if message["heart_rate"] and message["heart_rate"] > 120:
                anomalies.append(f"Anomalie: Fréquence cardiaque élevée ({message['heart_rate']} bpm)")
            if message["pression"] and message["pression"] < 90:
                anomalies.append(f"Anomalie: Pression basse ({message['pression']} %)")

            message["anomalies"] = anomalies

            client.publish(topic, json.dumps(message))
            print(f"SIM Published!\n")
            # print(f"SIM Published: {message}\n")
            time.sleep(2) 
  
    except requests.exceptions.RequestException as e:
        print(f"SIM Erreur lors de la récupération des données : {e}")
 

# Configuration du callback
client.on_message = on_message

# Abonnement au topic pour les requêtes utilisateur
client.subscribe(requestUserTopic)
# print(f"Abonné au topic: {requestUserTopic}")

# Boucle principale MQTT
client.loop_start()
 
while True:  
    date_today = datetime.now().strftime("%Y-%m-%d")
    date_yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    dataToday = fetch_statistics(url, "stat/", id_user, date_today) 
    dataYesterday = fetch_statistics(url, "stat/", id_user, date_yesterday) 
    publish_statistics(dataYesterday, dataToday, topicStat)
    # fetch_and_publish_simulation(url, "vitals/", id_user)
    time.sleep(2) 
    