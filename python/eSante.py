import paho.mqtt.client as mqtt
import requests
import time
import json
from datetime import datetime, timedelta
import threading
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration MQTT
broker = "localhost"
port = 1883
topic = "health/vitals"
topicUser = "health/vitals/user"
topicStat = "health/vitals/stats"
requestUserTopic = "health/vitals/user/request"

client = mqtt.Client()
client.connect(broker, port)

id_user = 4
stop_simulation = threading.Event()
simulation_thread = None

date_today = datetime.now().strftime("%Y-%m-%d")
date_yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

url = "https://iot-3s.onrender.com/api/simulation/"

# Configuration e-mail
SENDER_EMAIL = "nunolefort6@gmail.com"  
SENDER_PASSWORD = "jaaq bpsm yyjy rmjz"  
RECIPIENT_EMAIL = None  
email_lock = threading.Lock()  

# Fonction pour envoyer un e-mail
def send_email(subject, body, recipient_email):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = subject
        email_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #D9534F; text-align: center;">🚨 Alerte d'Anomalie Détectée 🚨</h2>
                <p>Bonjour,</p>
                <p>Nous avons détecté des valeurs anormales dans les relevés de votre simulation en temps réel :</p>
                <ul style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
                    {''.join(f'<li style="margin-bottom: 5px;">{anomaly}</li>' for anomaly in body.split('\n'))}
                </ul>
                <p>Merci de vérifier ces paramètres et de prendre les mesures nécessaires.</p>
                <p style="margin-top: 20px; font-size: 14px; color: #777;">Ceci est un e-mail automatique, veuillez ne pas y répondre.</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(email_body, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()
        
        print(f"E-mail envoyé à {recipient_email}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail : {e}")


 
def fetch_and_publish_user(url, api_name, id):
    global RECIPIENT_EMAIL
    uri = f"{url}{api_name}{id}"
    try:
        response = requests.get(uri)
        response.raise_for_status()
        response_data = response.json()
        if not response_data:
            print("⚠️ Aucune donnée reçue de l'API USER.")
            return  

        data = response_data[0]


        with email_lock:
            RECIPIENT_EMAIL = data.get("email")
            if not RECIPIENT_EMAIL:
                print(f"Aucun e-mail trouvé pour l'utilisateur {id}.")
            else:
                print(f"E-mail de l'utilisateur mis à jour : {RECIPIENT_EMAIL}")

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
            "email": RECIPIENT_EMAIL,
            "sante": sante,
            "libelle": data.get("libelle"),
            "spec": data.get("spec"),
        }

        client.publish(topicUser, json.dumps(message))
        print(f"Utilisateur chargé : {message}")

    except requests.exceptions.RequestException as e:
        print(f"USER Erreur lors de la récupération des données : {e}")
 
def fetch_statistics(url, api_name, id, date):
    uri = f"{url}{api_name}{id}"
    try:
        payload = {"date": date}
        response = requests.get(uri, params=payload)
        response.raise_for_status()
        response_data = response.json()
        if not response_data:
            print("⚠️ Aucune donnée reçue de l'API STAT.")
            return 

        data = response_data[0]


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
            anomalies.append(f"Température élevée ({message['avg_t']} °C)")
        if message["avg_h"] is not None and message["avg_h"] > 120:
            anomalies.append(f"Fréquence cardiaque élevée ({message['avg_h']} bpm)")
        if message["avg_p"] is not None and message["avg_p"] < 90:
            anomalies.append(f"Pression basse ({message['avg_p']} %)")

        message["anomalies"] = anomalies

        return message

    except requests.exceptions.RequestException as e:
        print(f"STAT Erreur lors de la récupération des données : {e}")

def publish_statistics(dataYesterday, dataToday, topicStats):
    message = [
        {"name": "Témperature (°C)", "hier": dataYesterday.get("avg_t"), "today": dataToday.get("avg_t")},
        {"name": "Heart rate (bpm)", "hier": dataYesterday.get("avg_h"), "today": dataToday.get("avg_h")},
        {"name": "Taux d'oxygène (%)", "hier": dataYesterday.get("avg_p"), "today": dataToday.get("avg_p")},
    ]

    client.publish(topicStats, json.dumps(message))

def fetch_and_publish_simulation(url, api_name, id):
    uri = f"{url}{api_name}{id}"
    try:
        while not stop_simulation.is_set():
            payload = {"date": datetime.now().strftime("%Y-%m-%d")}
            response = requests.get(uri, params=payload)
            response.raise_for_status()

            response_data = response.json()
            if not response_data:
                print("⚠️ Aucune donnée reçue de l'API SIMULATION.")
                return  

            data = response_data[0]

            # print(f"DATA : {data}")

            message = {
                "temperature": round(float(data.get("temperature", 0)), 1),
                "heart_rate": round(float(data.get("heart_rate", 0)), 1),
                "pression": round(float(data.get("pression", 0)), 1),
            }

            anomalies = []
            if message["temperature"] > 39.5:
                anomalies.append(f"Température élevée ({message['temperature']} °C)")
            if message["heart_rate"] > 120:
                anomalies.append(f"Fréquence cardiaque élevée ({message['heart_rate']} bpm)")
            if message["pression"] < 89:
                anomalies.append(f"Pression basse ({message['pression']} %)")

            message["anomalies"] = anomalies

            if anomalies:
                with email_lock:
                    if RECIPIENT_EMAIL:
                        subject = "Alerte d'anomalie détectée en temps réel"
                        body = f"Les anomalies suivantes ont été détectées :\n\n" + "\n".join(anomalies)
                        send_email(subject, body, RECIPIENT_EMAIL)
                    else:
                        print("Erreur : Aucun e-mail défini pour envoyer l'alerte.")

            client.publish(topic, json.dumps(message))

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

# Lancement initial de la simulation
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