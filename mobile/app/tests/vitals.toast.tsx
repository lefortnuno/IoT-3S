// Ce code contient une version de notification avec TOAST de react Native

import React, { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Slider from "@react-native-community/slider";
import axios from "axios";

import Info from "../components/info";
import Stat from "../components/stats";
import { useLocalSearchParams } from "expo-router";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

const screenWidth = Dimensions.get("window").width;

interface User {
  u_id: number;
  nom: string;
  prenom: string;
  address: string;
  date_naiss: string;
  email: string;
  sexe: string;
  sante: string;
}

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "green",
        backgroundColor: "#f0f0f0",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
      }}
      text2Style={{
        fontSize: 16,
        color: "#666",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "red",
        backgroundColor: "#fff",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
      }}
      text2Style={{
        fontSize: 16,
        color: "#666",
      }}
    />
  ),
};

export default function Vitals() {
  const { user } = useLocalSearchParams();

  const parsedUser: User = user
    ? JSON.parse(user as string)
    : {
        u_id: 1,
        nom: "Inconnu",
        prenom: "Inconnu",
        address: "Inconnue",
        date_naiss: "Inconnue",
        email: "Inconnu",
        sexe: "Inconnu",
        sante: "Inconnu",
      };

  const [temperature, setTemperature] = useState(35.5);
  const [heartRate, setHeartRate] = useState(58);
  const [spo2, setSpo2] = useState(88);
  const [intensity, setIntensity] = useState(0);
  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [spo2Data, setSpo2Data] = useState<number[]>([]);
  const [isStat, setIsStat] = useState(true);
  let notificationQueue: string[] = [];
  const processNotifications = () => {
    if (notificationQueue.length > 0) {
      const nextNotification = notificationQueue.shift();
      if (nextNotification) {
        Toast.show({
          type: "error",
          text1: "⚠️ Alerte",
          text2: nextNotification,
          position: "top",
          visibilityTime: 3000,
          onHide: processNotifications,
        });
      }
    }
  };

  const addToQueue = (message: string) => {
    notificationQueue.push(message);
    if (notificationQueue.length === 1) {
      processNotifications();
    }
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true, // Activer le son par défaut
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    const simulateVitals = () => {
      const multiplier = 1 + intensity / 100;

      if (intensity <= 30) {
        const newTemperature =
          temperature + (Math.random() * 0.2 - 0.1) * multiplier;
        setTemperature(newTemperature);

        const variationH = (Math.random() * 4 - 2) * multiplier;
        const newHeartRate = Math.min(
          120,
          Math.max(45, heartRate + variationH)
        );
        setHeartRate(parseFloat(newHeartRate.toFixed(2)));

        const variation = (Math.random() * 2 - 1) * multiplier;
        const newSpo2 = Math.min(120, Math.max(75, spo2 + variation));
        setSpo2(parseFloat(newSpo2.toFixed(2)));
      } else {
        const newTemperature = Math.min(42, temperature + 0.1 * multiplier);
        setTemperature(newTemperature);

        const newHeartRate = Math.min(120, heartRate + 1 * multiplier);
        setHeartRate(parseFloat(newHeartRate.toFixed(2)));

        const newSpo2 = Math.min(120, spo2 + 0.5 * multiplier);
        setSpo2(parseFloat(newSpo2.toFixed(2)));
      }

      if (temperature > 36) {
        addToQueue("Température élevée détectée (> 39°C) !");
        Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Température élevée !",
            body: `Température détectée : ${temperature.toFixed(1)}°C`,
            sound: "default",
          },
          trigger: null,
        });
      }
      if (heartRate > 60) {
        addToQueue("Fréquence cardiaque élevée détectée (> 81 bpm) !");
        Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Fréquence cardiaque élevée !",
            body: `Fréquence détectée : ${heartRate} bpm`,
            sound: "default",
          },
          trigger: null,
        });
      }
      if (spo2 > 88) {
        addToQueue("Niveau de SpO2 élevé détecté (> 105%) !");
        Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Niveau de SpO2 élevé !",
            body: `SpO2 détecté : ${spo2}%`,
            sound: "default",
          },
          trigger: null,
        });
      }

      const vitalsData = {
        u_id: parsedUser.u_id,
        c: temperature.toFixed(1),
        bpm: Math.round(heartRate),
        spo2: Math.round(spo2),
      };

      axios
        .post("http://192.168.1.10:5111/api/simulation/", vitalsData)
        .then(() => {
          console.log("Data sent successfully");
        })
        .catch((error) => {
          console.error("Error sending data:", error);
        });

      setHeartRateData((prevData) => [...prevData, heartRate].slice(-10));
      setTemperatureData((prevData) => [...prevData, temperature].slice(-10));
      setSpo2Data((prevData) => [...prevData, spo2].slice(-10));
    };

    const interval = setInterval(simulateVitals, 2000);

    return () => clearInterval(interval);
  }, [temperature, heartRate, spo2, intensity]);

  const showToStats = () => {
    setIsStat(!isStat);
  };

  return (
    <View style={styles.container}>
      <Info user={parsedUser} />
      <Toast config={toastConfig} />

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Temperature</Text>
          <Text style={styles.tableHeader}>Heart Rate</Text>
          <Text style={styles.tableHeader}>SpO2</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{temperature.toFixed(1)}°C</Text>
          <Text style={styles.tableCell}>{heartRate} bpm</Text>
          <Text style={styles.tableCell}>{spo2}%</Text>
        </View>
      </View>

      <View style={styles.sliderAndButtonContainer}>
        <View style={styles.sliderContainer}>
          <Text style={styles.bbold}>Simulation d'Exercice: {intensity}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={intensity}
            onValueChange={setIntensity}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#D3D3D3"
            thumbTintColor="#1EB1FC"
          />
        </View>
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsStat(!isStat)}
        >
          <Image
            source={require("../../assets/images/diagramme.png")}
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      {isStat ? (
        <>
          <Text style={styles.title}>Signe Vitaux</Text>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title for Temperature Chart */}
            <Text style={styles.chartTitle}>Température</Text>
            <BarChart
              style={styles.chartGraphe}
              data={{
                labels: new Array(temperatureData.length).fill(""),
                datasets: [
                  {
                    data: temperatureData,
                    color: (opacity = 1) =>
                      temperature < 36
                        ? `rgba(0, 0, 255, ${opacity})`
                        : temperature > 39
                        ? `rgba(255, 0, 0, ${opacity})`
                        : `rgba(255, 165, 0, ${opacity})`,
                  },
                ],
              }}
              width={screenWidth - 30}
              height={200}
              chartConfig={{
                backgroundColor: "#bcbcbc",
                backgroundGradientFrom: "#bcbcbc",
                backgroundGradientTo: "#bcbcbc",
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  temperature < 36
                    ? `rgba(0, 0, 255, ${opacity})`
                    : temperature > 39
                    ? `rgba(255, 0, 0, ${opacity})`
                    : `rgba(255, 165, 0, ${opacity})`, // Bleu, Orange, Rouge selon la température
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
            />

            {/* Title for Heart Rate Chart */}
            <Text style={styles.chartTitle}>Fréquence Cardiaque</Text>
            <LineChart
              style={styles.chartGraphe}
              data={{
                labels:
                  heartRateData.length > 0
                    ? new Array(heartRateData.length).fill("")
                    : [],
                datasets: [
                  {
                    data: heartRateData.length > 0 ? heartRateData : [0],
                    color: (opacity = 1) =>
                      heartRate < 81
                        ? `rgba(0, 255, 0, ${opacity})`
                        : `rgba(255, 0, 0, ${opacity})`,
                  },
                ],
              }}
              width={screenWidth - 30}
              height={200}
              chartConfig={{
                backgroundColor: "#bcbcbc",
                backgroundGradientFrom: "#bcbcbc",
                backgroundGradientTo: "#bcbcbc",
                decimalPlaces: 2,
                color: (opacity = 1) =>
                  heartRate < 81
                    ? `rgba(0, 255, 0, ${opacity})`
                    : `rgba(255, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
              }}
              bezier
            />

            {/* Title for SpO2 Chart */}
            <Text style={styles.chartTitle}>SpO2</Text>
            <PieChart
              data={[
                {
                  name: "SpO2",
                  population: spo2,
                  color:
                    spo2 < 105 ? "rgba(0, 255, 0, 1)" : "rgba(255, 0, 0, 1)",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Rest",
                  population: parseFloat((120 - spo2).toFixed(2)),
                  color: "rgba(192, 192, 192, 1)",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth - 40}
              height={180}
              chartConfig={{
                backgroundColor: "#a6a6a6",
                backgroundGradientFrom: "#a6a6a6",
                backgroundGradientTo: "#a6a6a6",
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          </ScrollView>
        </>
      ) : (
        <Stat u_id={parsedUser.u_id} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    paddingLeft: 20,
  },
  sliderAndButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  sliderContainer: {
    width: "80%",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  eyeButton: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  chartGraphe: {
    alignItems: "center",
    marginBottom: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
    paddingLeft: 5,
  },
  table: {
    width: "100%",
    marginVertical: 0,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  tableHeader: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  bbold: {
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
