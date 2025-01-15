import paho.mqtt.client as mqtt
import requests
import time
import json
from datetime import datetime
 
broker = "localhost"   
port = 1883
topic = "health/vitals"
topicUser = "health/vitals/user"
topicResume = "health/vitals/resumes"
 
client = mqtt.Client()
client.connect(broker, port)
 
id_user = 1
id_user_tmp = id_user
url = "https://iot-3s.onrender.com/api/simulation/" 
# url = "http://192.168.1.10:5111/api/simulation/" 
 

def fetch_and_publish_user(url, api_name, id):
    uri = f"{url}{api_name}{id}"
    try: 
        response = requests.get(uri)   
        response.raise_for_status()  
        data = response.json()[0]
         
        message = {
            "u_id": data.get("u_id"),
            "nom": data.get("nom"),
            "prenom": data.get("prenom"),
            "date_naiss": data.get("date_naiss"),
            "sexe": data.get("sexe"),
            "adress": data.get("adress"),
            "email": data.get("email"),
            "pic": data.get("pic"),
        }
 
        client.publish(topicUser, json.dumps(message))
        print(f"USER Published! \n")  

    except requests.exceptions.RequestException as e:
        print(f"USER Erreur lors de la récupération des données : {e}")


def fetch_and_publish_statistics(url, api_name, id):
    uri = f"{url}{api_name}{id}"
    try: 
        payload = {
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        response = requests.get(uri, params=payload)
        response.raise_for_status()  
        data = response.json()[0] 
         
        # message = {
        #     "max_t": round(float(data.get("max_t", 0)), 2),
        #     "max_h": round(float(data.get("max_h", 0)), 2),
        #     "max_p": round(float(data.get("max_p", 0)), 2),
        #     "min_t": round(float(data.get("min_t", 0)), 2),
        #     "min_h": round(float(data.get("min_h", 0)), 2),
        #     "min_p": round(float(data.get("min_p", 0)), 2),
        #     "avg_t": round(float(data.get("avg_t", 0)), 2),
        #     "avg_h": round(float(data.get("avg_h", 0)), 2),
        #     "avg_p": round(float(data.get("avg_p", 0)), 2),
        # }
        message = {
            "max_t": data.get("max_t"),
            "max_h": data.get("max_h"),
            "max_p": data.get("max_p"),
            "min_t": data.get("min_t"),
            "min_h": data.get("min_h"),
            "min_p": data.get("min_p"),
            "avg_t": data.get("avg_t"),
            "avg_h": data.get("avg_h"),
            "avg_p": data.get("avg_p"),
        }

        anomalies = []
        if message["avg_t"] and message["avg_t"] > 39.0:
            anomalies.append(f"Anomalie: Température élevée ({message['avg_t']} °C)")
        if message["avg_h"] and message["avg_h"] > 120:
            anomalies.append(f"Anomalie: Fréquence cardiaque élevée ({message['avg_h']} bpm)")
        if message["avg_p"] and message["avg_p"] < 90:
            anomalies.append(f"Anomalie: Pression basse ({message['avg_p']} %)")

        message["anomalies"] = anomalies 

        client.publish(topicResume, json.dumps(message))
        print(f"STAT Published!\n") 

    except requests.exceptions.RequestException as e:
        print(f"STAT Erreur lors de la récupération des données : {e}")


def fetch_and_publish(url, api_name, id):
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
 
 
while True:
    if id_user != 0:
        fetch_and_publish_user(url, "user/", id_user)
        fetch_and_publish_statistics(url, "stat/", id_user) 
        id_user = 0

    fetch_and_publish(url, "vitals/", id_user_tmp) 
    time.sleep(5) 
    