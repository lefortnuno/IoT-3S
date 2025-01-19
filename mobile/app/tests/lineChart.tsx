// LINE CHART AVEC DES VALEURS DE YoY' FIXEE MAIS C'EST MOUCHE

import React, { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";

import Info from "../components/info";
import Stat from "../components/stats";
import { useLocalSearchParams } from "expo-router";

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

  const [heartRate, setHeartRate] = useState(58);
  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [lastHeartRate, setLastHeartRate] = useState(58);

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
          `http://192.168.1.10:5111/api/simulation/vitals/${
            parsedUser.u_id
          }?date=${new Date().toISOString().split("T")[0]}`
        )
        .then((response) => {
          if (response.data.length > 0) {
            const first10Data = response.data.slice(0, 10);

            type VitalData = {
              heart_rate: number;
            };

            const heartRateValues = first10Data
              .map((item: VitalData) => item.heart_rate)
              .filter((value) => typeof value === "number" && !isNaN(value)); // E1

            setHeartRateData(heartRateValues);
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
          `http://192.168.1.10:5111/api/simulation/vitals/${
            parsedUser.u_id
          }?date=${new Date().toISOString().split("T")[0]}`
        )
        .then((response) => {
          const newHeartRate = response.data[0]?.heart_rate; //E2

          if (
            newHeartRate !== undefined &&
            !isNaN(newHeartRate) &&
            newHeartRate !== lastHeartRate
          ) {
            setHeartRate(newHeartRate);
            setLastHeartRate(newHeartRate);
            setHeartRateData((prevData) =>
              [...prevData, newHeartRate]
                .slice(-10)
                .filter((value) => !isNaN(value))
            ); //E3

            if (newHeartRate > 295) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "⚠️ Fréquence cardiaque élevée !",
                  body: `Fréquence détectée : ${newHeartRate} bpm`,
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
  }, [lastHeartRate]);

  return (
    <View style={styles.container}>
      <Info user={parsedUser} />

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Heart Rate</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{heartRate} bpm</Text>
        </View>
      </View>

      <Text style={styles.title}>Signe Vitaux</Text>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                data: heartRateData.length > 0 ? heartRateData : [0], // Données normales ou une valeur par défaut
                color: (opacity = 1) =>
                  heartRate < 81
                    ? `rgba(0, 255, 0, ${opacity})`
                    : `rgba(255, 0, 0, ${opacity})`,
              },
            ],
          }}
          width={screenWidth - 30}
          height={200}
          fromZero={true} // Force l'axe Y à commencer à 0
          chartConfig={{
            backgroundColor: "#bcbcbc",
            backgroundGradientFrom: "#bcbcbc",
            backgroundGradientTo: "#bcbcbc",
            decimalPlaces: 0, // Aucune décimale sur les valeurs de l'axe Y
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "3",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: "#ccc",
            },
          }}
          yAxisLabel=""
          yAxisSuffix=" bpm"
          yAxisInterval={1} // Affiche les valeurs tous les 1 unité
          segments={5} // Découpe l'axe Y en 5 segments pour mieux contrôler l'échelle
        />
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
