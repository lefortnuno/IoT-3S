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

const screenWidth = Dimensions.get("window").width; 

// const BASE_URL_LOCAL = "http://192.168.1.10:5111/api/simulation/";
const BASE_URL = "https://iot-3s.onrender.com/api/simulation/";

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

export default function VitalsArduino() {
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

  const [temperature, setTemperature] = useState(36.5);
  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [lastTemperature, setLastTemperature] = useState(36.5);

  const [heartRate, setHeartRate] = useState(65);
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [lastHeartRate, setLastHeartRate] = useState(65);

  const [spo2, setSpo2] = useState(95);
  const [spo2Data, setSpo2Data] = useState<number[]>([]);
  const [lastSpo2, setLastSpo2] = useState(95);

  const [isStat, setIsStat] = useState(true);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    const vitalsDBdata = () => {
      axios
        .get(
          BASE_URL +
            `vitals/${parsedUser.u_id}?date=${
              new Date().toISOString().split("T")[0]
            }`
        )
        .then((response) => {
          console.log("1rst time Data fetch successfully");
          if (response.data.length > 0) {
            const first10Data = response.data.slice(0, 10);

            type VitalData = {
              temperature: number;
              heart_rate: number;
              pression: number;
            };

            const temperatureValues = first10Data.map(
              (item: VitalData) => item.temperature
            );
            const heartRateValues = first10Data.map(
              (item: VitalData) => item.heart_rate
            );
            const spo2Values = first10Data.map(
              (item: VitalData) => item.pression
            );

            setTemperatureData(temperatureValues);
            setHeartRateData(heartRateValues);
            setSpo2Data(spo2Values);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    vitalsDBdata();
  }, []);

  useEffect(() => {
    const simulateVitals = () => {
      axios
        .get(
          BASE_URL +
            `vitals/${parsedUser.u_id}?date=${
              new Date().toISOString().split("T")[0]
            }`
        )
        .then((response) => {
          console.log("Data fetch successfully");
          const newTemperature = response.data[0].temperature;
          const newHeartRate = response.data[0].heart_rate;
          const newSpo2 = response.data[0].pression;

          if (
            newTemperature !== lastTemperature ||
            newHeartRate !== lastHeartRate ||
            newSpo2 !== lastSpo2
          ) {
            setTemperature(newTemperature);
            setLastTemperature(newTemperature);
            setTemperatureData((prevData) =>
              [...prevData, newTemperature].slice(-10)
            );

            setHeartRate(newHeartRate);
            setLastHeartRate(newHeartRate);
            setHeartRateData((prevData) =>
              [...prevData, newHeartRate].slice(-10)
            );

            setSpo2(newSpo2);
            setLastSpo2(newSpo2);
            setSpo2Data((prevData) => [...prevData, newSpo2].slice(-10));

            if (newTemperature > 39.5) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "⚠️ Température élevée !",
                  body: `Température détectée : ${newTemperature.toFixed(1)}°C`,
                  sound: "default",
                },
                trigger: null,
              });
            }

            if (newHeartRate > 120) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "⚠️ Fréquence cardiaque élevée !",
                  body: `Fréquence détectée : ${newHeartRate} bpm`,
                  sound: "default",
                },
                trigger: null,
              });
            }

            if (newSpo2 < 89) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "⚠️ Niveau de SpO2 élevé !",
                  body: `SpO2 détecté : ${newSpo2}%`,
                  sound: "default",
                },
                trigger: null,
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    const interval = setInterval(simulateVitals, 2000);

    return () => clearInterval(interval);
  }, [lastTemperature, lastHeartRate, lastSpo2]);

  const showToStats = () => {
    setIsStat(!isStat);
  };

  return (
    <View style={styles.container}>
      <Info user={parsedUser} />

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Température</Text>
          <Text style={styles.tableHeader}>Heart Rate</Text>
          <Text style={styles.tableHeader}>Taux d'Oxygène</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{temperature.toFixed(1)}°C</Text>
          <Text style={styles.tableCell}>{heartRate} bpm</Text>
          <Text style={styles.tableCell}>{spo2}%</Text>
        </View>
      </View>

      <View style={styles.sliderAndButtonContainer}>
        <View style={styles.sliderContainer}>
          <Text style={styles.bbold}>Simulation d'Exercice: 1%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={1}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#D3D3D3"
            thumbTintColor="#1EB1FC"
            disabled={true}
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
                      temperature < 37.2
                        ? `rgba(0, 0, 255, ${opacity})`
                        : temperature > 39.5
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
                  temperature < 37.2
                    ? `rgba(0, 0, 255, ${opacity})`
                    : temperature > 39.5
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
                      heartRate < 120
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
                  heartRate < 120
                    ? `rgba(0, 255, 0, ${opacity})`
                    : `rgba(255, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
              }}
              bezier
            />

            {/* Title for SpO2 Chart */}
            <Text style={styles.chartTitle}>Taux d'Oxygène</Text>
            <PieChart
              data={[
                {
                  name: "SpO2",
                  population: spo2,
                  color:
                    spo2 < 89 ? "rgba(255, 0, 0, 1)" : "rgba(0, 255, 0, 1)",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Rest",
                  population: parseFloat((100 - spo2).toFixed(2)),
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
