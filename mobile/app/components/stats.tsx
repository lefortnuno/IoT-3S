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
  u_id: number;
}

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
    setLoading(true);
    setError(null);
    try {
      const today = formatDate(new Date());
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const [todayRes, yesterdayRes] = await Promise.all([
        axios.get<Stat[]>(
          `http://192.168.1.10:5111/api/simulation/stat/${u_id}?date=${today}`
        ),
        axios.get<Stat[]>(
          `http://192.168.1.10:5111/api/simulation/stat/${u_id}?date=${yesterday}`
        ),
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
    fetchStats();
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
            todayData={[statToday.max_t, statToday.min_t, statToday.avg_t]}
            yesterdayData={[
              statYesterday.max_t,
              statYesterday.min_t,
              statYesterday.avg_t,
            ]}
          />
          <StatChart
            title="Heart Rate"
            labels={["Max", "Min", "Moyenne"]}
            todayData={[statToday.max_h, statToday.min_h, statToday.avg_h]}
            yesterdayData={[
              statYesterday.max_h,
              statYesterday.min_h,
              statYesterday.avg_h,
            ]}
          />
          <StatChart
            title="SpO2"
            labels={["Max", "Min", "Moyenne"]}
            todayData={[statToday.max_p, statToday.min_p, statToday.avg_p]}
            yesterdayData={[
              statYesterday.max_p,
              statYesterday.min_p,
              statYesterday.avg_p,
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
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>Aucune donnée disponible.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
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
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
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
  tableCell: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    flex: 1,
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default Stat;
