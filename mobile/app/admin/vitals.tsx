import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Slider from "@react-native-community/slider";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;

export default function Vitals() {
  const userData = {
    nom: "LEFORT",
    prenom: "N. Nuno",
    address: "Rabat",
    date_naiss: "29-07-2000",
    email: "nuno@gmail.com",
    sexe: "H",
    coms: "en bonne santé",
  };
  const [temperature, setTemperature] = useState(35.5);
  const [heartRate, setHeartRate] = useState(58);
  const [spo2, setSpo2] = useState(88);
  const [intensity, setIntensity] = useState(0); // Intensité de l'exercice
  const [heartRateData, setHeartRateData] = useState<number[]>([]);
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [spo2Data, setSpo2Data] = useState<number[]>([]);

  useEffect(() => {
    const simulateVitals = () => {
      const multiplier = 1 + intensity / 100;

      if (intensity <= 30) {
        // Variations normales pour une intensité inférieure ou égale à 30
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
        // Croissance constante pour une intensité supérieure à 30
        const newTemperature = Math.min(42, temperature + 0.1 * multiplier);
        setTemperature(newTemperature);

        const newHeartRate = Math.min(120, heartRate + 1 * multiplier);
        setHeartRate(parseFloat(newHeartRate.toFixed(2)));

        const newSpo2 = Math.min(120, spo2 + 0.5 * multiplier);
        setSpo2(parseFloat(newSpo2.toFixed(2)));
      }

      // Préparation des données pour l'API
      const vitalsData = {
        u_id: 1,
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

      // Mise à jour des graphiques
      setHeartRateData((prevData) => [...prevData, heartRate].slice(-10)); // Garder les 10 dernières valeurs
      setTemperatureData((prevData) => [...prevData, temperature].slice(-10)); // Garder les 10 dernières valeurs
      setSpo2Data((prevData) => [...prevData, spo2].slice(-10)); // Garder les 10 dernières valeurs
    };

    const interval = setInterval(simulateVitals, 2000);

    return () => clearInterval(interval);
  }, [temperature, heartRate, spo2, intensity]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Information Santé </Text>
      <Text style={styles.description}>
        Le patient {userData.nom} {userData.prenom}, né(e) le{" "}
        {userData.date_naiss}, résidant à {userData.address} est {userData.coms}
        . Son email : {userData.email}.
      </Text>

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

      {/* Barre de progression d'intensité */}
      <View style={styles.sliderContainer}>
        <Text>Exercise Intensity: {intensity}%</Text>
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
      {/* <View style={styles.graphContainer}> */}
      {/* Graphique de la température */}
      <BarChart
        style={styles.chartGraphe}
        data={{
          labels: new Array(temperatureData.length).fill(""),
          datasets: [
            {
              data: temperatureData,
            },
          ],
        }}
        width={(screenWidth - 30) / 1} // Ajuste la largeur pour les mettre côte à côte
        height={200}
        chartConfig={{
          backgroundColor: "#bcbcbc",
          backgroundGradientFrom: "#bcbcbc",
          backgroundGradientTo: "#bcbcbc",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 119, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
      />

      {/* Graphique de la fréquence cardiaque */}
      <LineChart
        style={styles.chartGraphe}
        data={{
          labels: new Array(heartRateData.length).fill(""),
          datasets: [
            {
              data: heartRateData,
            },
          ],
        }}
        width={(screenWidth - 30) / 1} // Ajuste la largeur pour les mettre côte à côte
        height={200}
        chartConfig={{
          backgroundColor: "#bcbcbc",
          backgroundGradientFrom: "#bcbcbc",
          backgroundGradientTo: "#bcbcbc",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
      />
      {/* </View> */}

      {/* Graphique du SpO2 */}
      <PieChart
        data={[
          {
            name: "SpO2",
            population: spo2,
            color: "rgba(0, 255, 0, 1)",
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    // alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "left",
    marginVertical: 10,
    color: "#333",
  },

  sliderContainer: {
    width: "80%",
    marginTop: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  graphContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  chartGraphe: { 
    alignItems:"center",
    marginBottom: 5,
  },

  table: {
    width: "100%",
    marginVertical: 0,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
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
});
