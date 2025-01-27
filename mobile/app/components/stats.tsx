import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart } from "react-native-chart-kit";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

// const BASE_URL_LOCAL = "http://192.168.1.10:5111/api/simulation/";
const BASE_URL = "https://iot-3s.onrender.com/api/simulation/";

interface Stat {
  max_t: number | null;
  max_h: number | null;
  max_p: number | null;
  min_t: number | null;
  min_h: number | null;
  min_p: number | null;
  avg_t: number | null;
  avg_h: number | null;
  avg_p: number | null;
}

interface Props {
  u_id: number;
}

const safeValue = (value: number | null | undefined, decimals = 2): string =>
  value !== null && value !== undefined ? value.toFixed(decimals) : "N/A";

const StatChart: React.FC<{
  title: string;
  labels: string[];
  todayData: number[];
  yesterdayData: number[];
}> = ({ title, labels, todayData, yesterdayData }) => {
  const mergedData = labels.flatMap((label, index) => [
    { value: yesterdayData[index], color: "rgba(255, 182, 193, 1)" },
    { value: todayData[index], color: "rgba(13, 50, 240, 1)" },
  ]);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <BarChart
        data={{
          labels: labels.flatMap((label) => [
            `Hier - ${label}`,
            `Aujourd'hui - ${label}`,
          ]),
          datasets: [
            {
              data: mergedData.map((item) => item.value),
              colors: mergedData.map((item) => (opacity: number) => item.color),
            },
          ],
        }}
        width={screenWidth - 40}
        height={180}
        chartConfig={{
          backgroundColor: "#f0f0f0",
          backgroundGradientFrom: "#f0f0f0",
          backgroundGradientTo: "#e0e0e0",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 8 },
        }}
        verticalLabelRotation={30}
        fromZero
      />
    </View>
  );
};

const Stat: React.FC<Props> = ({ u_id }) => {
  const [statToday, setStatToday] = useState<Stat | null>(null);
  const [statYesterday, setStatYesterday] = useState<Stat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const fetchStats = async () => {
    // setLoading(true);
    setError(null);
    try {
      const today = formatDate(new Date());
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const [todayRes, yesterdayRes] = await Promise.all([
        axios.get<Stat[]>(BASE_URL + `stat/${u_id}?date=${today}`),
        axios.get<Stat[]>(BASE_URL + `stat/${u_id}?date=${yesterday}`),
      ]);

      setStatToday(todayRes.data[0] || null);
      setStatYesterday(yesterdayRes.data[0] || null);
    } catch (err) {
      setError(
        "Erreur lors du chargement des données. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStats, 2000);

    return () => clearInterval(interval);
  }, [u_id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const isDataValid = statToday && statYesterday;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Stats</Text>
      {isDataValid ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <StatChart
            title="Température"
            labels={["Max", "Min", "Moyenne"]}
            todayData={[
              statToday?.max_t ?? 0,
              statToday?.min_t ?? 0,
              statToday?.avg_t ?? 0,
            ]}
            yesterdayData={[
              statYesterday?.max_t ?? 0,
              statYesterday?.min_t ?? 0,
              statYesterday?.avg_t ?? 0,
            ]}
          />
          <StatChart
            title="Fréquence Cardiaque"
            labels={["Max", "Min", "Moyenne"]}
            todayData={[
              statToday?.max_h ?? 0,
              statToday?.min_h ?? 0,
              statToday?.avg_h ?? 0,
            ]}
            yesterdayData={[
              statYesterday?.max_h ?? 0,
              statYesterday?.min_h ?? 0,
              statYesterday?.avg_h ?? 0,
            ]}
          />
          <StatChart
            title="Taux d'Oxygène"
            labels={["Max", "Min", "Moyenne"]}
            todayData={[
              statToday?.max_p ?? 0,
              statToday?.min_p ?? 0,
              statToday?.avg_p ?? 0,
            ]}
            yesterdayData={[
              statYesterday?.max_p ?? 0,
              statYesterday?.min_p ?? 0,
              statYesterday?.avg_p ?? 0,
            ]}
          />

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
                {safeValue(statYesterday?.avg_t)}
              </Text>
              <Text style={styles.tableCell}>
                {safeValue(statToday?.avg_t)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Heart Rate (BPM)</Text>
              <Text style={styles.tableCell}>
                {safeValue(statYesterday?.avg_h)}
              </Text>
              <Text style={styles.tableCell}>
                {safeValue(statToday?.avg_h)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Taux d'Oxygène (%)</Text>
              <Text style={styles.tableCell}>
                {safeValue(statYesterday?.avg_p)}
              </Text>
              <Text style={styles.tableCell}>
                {safeValue(statToday?.avg_p)}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>Aucune donnée disponible.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    paddingLeft: 20,
  },
  chartContainer: {
    marginVertical: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  loadingText: { textAlign: "center", marginTop: 10, color: "#555" },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  tableContainer: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableHeader: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    flex: 1,
  },
  tableCell: { fontSize: 16, textAlign: "center", color: "#555", flex: 1 },
  noDataText: { textAlign: "center", color: "#888", marginTop: 20 },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
});

export default Stat;
