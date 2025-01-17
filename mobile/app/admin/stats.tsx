import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import { Dimensions, View, Text, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface Stat {
  max_t: number;
  max_h: number;
  max_p: number;
  min_t: number;
  min_h: number;
  min_p: number;
  avg_t: number;
  avg_h: number;
  avg_p: number;
}

interface Props {
  u_id2: number;
}

export default function Stat({ u_id2 }: Props) {
  const u_id = 2;
  const [statToday, setTodayStat] = useState<Stat | null>(null);
  const [statYesterday, setYesterdayStat] = useState<Stat | null>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const getStatToday = async () => {
    const today = formatDate(new Date());
    try {
      const response = await axios.get<Stat>(
        `http://192.168.1.10:5111/api/simulation/stat/${u_id}?date=${today}`
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTodayStat(response.data[0]);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données d'aujourd'hui :",
        error
      );
    }
  };

  const getStatYesterday = async () => {
    const yesterday = formatDate(new Date(Date.now() - 86400000)); // 1 jour avant
    try {
      const response = await axios.get<Stat>(
        `http://192.168.1.10:5111/api/simulation/stat/${u_id}?date=${yesterday}`
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        setYesterdayStat(response.data[0]);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données d'hier :",
        error
      );
    }
  };

  useEffect(() => {
    getStatToday();
    getStatYesterday();
  }, [u_id2]);

  const isDataValid =
    statToday?.avg_t != null &&
    statToday?.avg_h != null &&
    statToday?.avg_p != null &&
    statYesterday?.avg_t != null &&
    statYesterday?.avg_h != null &&
    statYesterday?.avg_p != null;

  const renderBarChart = (
    title: string,
    labels: string[],
    todayData: number[],
    yesterdayData: number[],
    colors: [string, string]
  ) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <BarChart
        data={{
          labels,
          datasets: [
            {
              data: yesterdayData,
              color: () => colors[0], // Couleur pour hier
            },
            {
              data: todayData,
              color: () => colors[1], // Couleur pour aujourd'hui
            },
          ],
        }}
        width={screenWidth - 40}
        height={100}
        chartConfig={{
          backgroundColor: "#f0f0f0",
          backgroundGradientFrom: "#f0f0f0",
          backgroundGradientTo: "#e0e0e0",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        verticalLabelRotation={30}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistiques : Hier & Aujourd'hui</Text>
      {isDataValid ? (
        <>
          {/* Graphique des valeurs minimales */}
          {renderBarChart(
            "Valeurs Minimales",
            ["Température", "Heart Rate", "SpO2"],
            [statToday.min_t, statToday.min_h, statToday.min_p],
            [statYesterday.min_t, statYesterday.min_h, statYesterday.min_p],
            ["rgba(255, 182, 193, 1)", "rgba(135, 206, 250, 1)"]
          )}

          {/* Graphique des moyennes */}
          {renderBarChart(
            "Valeurs Moyennes",
            ["Température", "Heart Rate", "SpO2"],
            [statToday.avg_t, statToday.avg_h, statToday.avg_p],
            [statYesterday.avg_t, statYesterday.avg_h, statYesterday.avg_p],
            ["rgba(255, 182, 193, 1)", "rgba(135, 206, 250, 1)"]
          )}

          {/* Graphique des valeurs maximales */}
          {renderBarChart(
            "Valeurs Maximales",
            ["Température", "Heart Rate", "SpO2"],
            [statToday.max_t, statToday.max_h, statToday.max_p],
            [statYesterday.max_t, statYesterday.max_h, statYesterday.max_p],
            ["rgba(255, 182, 193, 1)", "rgba(135, 206, 250, 1)"]
          )}

          {/* Tableau des moyennes */}
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Moyenne</Text>
              <Text style={styles.tableHeader}>Hier</Text>
              <Text style={styles.tableHeader}>Aujourd'hui</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Température (°C)</Text>
              <Text style={styles.tableCell}>
                {statYesterday.avg_t.toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>{statToday.avg_t.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Heart Rate (BPM)</Text>
              <Text style={styles.tableCell}>
                {statYesterday.avg_h.toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>{statToday.avg_h.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>SpO2 (%)</Text>
              <Text style={styles.tableCell}>
                {statYesterday.avg_p.toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>{statToday.avg_p.toFixed(2)}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text>Chargement des données...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  chartContainer: {
    marginVertical: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tableContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeader: {
    fontWeight: "bold",
    width: "33%",
    textAlign: "center",
  },
  tableCell: {
    width: "33%",
    textAlign: "center",
  },
});
