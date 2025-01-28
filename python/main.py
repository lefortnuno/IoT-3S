import paho.mqtt.client as mqtt
import requests
import time
import json
from datetime import datetime, timedelta
import threading
 
broker = "localhost"   
port = 1883
topic = "health/vitals"
topicUser = "health/vitals/user"
topicStat = "health/vitals/stats" 
requestUserTopic = "health/vitals/user/request"
 
client = mqtt.Client()
client.connect(broker, port)
 
id_user = 1
stop_simulation = threading.Event()
simulation_thread = None

date_today = datetime.now().strftime("%Y-%m-%d")
date_yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

url = "https://iot-3s.onrender.com/api/simulation/" 
# url = "http://192.168.1.10:5111/api/simulation/" 

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
        while not stop_simulation.is_set():
            payload = {"date": datetime.now().strftime("%Y-%m-%d")}
            response = requests.get(uri, params=payload)
            response.raise_for_status()  
            data = response.json()[0] 
            # print(f"DATA : {data}\n")
 
            message = { 
                "temperature": round(float(data.get("temperature", 0)), 1),
                "heart_rate":  round(float(data.get("heart_rate", 0)), 1),
                "pression":  round(float(data.get("pression", 0)), 1), 
            }

            anomalies = []
            if message["temperature"] and message["temperature"] > 39.5:
                anomalies.append(f"Anomalie: Température élevée ({message['temperature']} °C)")
            if message["heart_rate"] and message["heart_rate"] > 120:
                anomalies.append(f"Anomalie: Fréquence cardiaque élevée ({message['heart_rate']} bpm)")
            if message["pression"] and message["pression"] < 89:
                anomalies.append(f"Anomalie: Pression basse ({message['pression']} %)")

            message["anomalies"] = anomalies

            client.publish(topic, json.dumps(message))
            # print(f"SIM Published!")
            print(f"SIM Published: {message}\n")
            
            dataToday = fetch_statistics(url, "stat/", id_user, date_today) 
            dataYesterday = fetch_statistics(url, "stat/", id_user, date_yesterday) 
            publish_statistics(dataYesterday, dataToday, topicStat)

            time.sleep(2) 
  
    except requests.exceptions.RequestException as e:
        print(f"SIM Erreur lors de la récupération des données : {e}")
 

def on_message(client, userdata, msg):
    global id_user, stop_simulation, simulation_thread
    try:
        payload = msg.payload.decode("utf-8") 
        new_id_user = int(payload)
        if new_id_user > 0: 
            id_user = new_id_user

            stop_simulation.set()
            if simulation_thread and simulation_thread.is_alive():
                simulation_thread.join()
            stop_simulation.clear()
            simulation_thread = threading.Thread(target=fetch_and_publish_simulation, args=(url, "vitals/", id_user))
            simulation_thread.start()

            fetch_and_publish_user(url, "user/", id_user)  

        else:
            print(f"ID utilisateur invalide: {id_user}")
    except ValueError:
        print(f"Erreur de parsing de l'ID utilisateur: {msg.payload}")

 
client.on_message = on_message 
client.subscribe(requestUserTopic) 
client.loop_start()
 
# La première simulation
simulation_thread = threading.Thread(target=fetch_and_publish_simulation, args=(url, "vitals/", id_user))
simulation_thread.start()

# Garder le script actif
try:
    while True:
        time.sleep(2)
except KeyboardInterrupt:
    stop_simulation.set()
    simulation_thread.join()
    client.loop_stop()
    client.disconnect()
 
    