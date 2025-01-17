import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

interface User {
  u_id: number;
  nom: string;
  prenom: string;
  date_naiss: string;
  adress: string;
  email: string;
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get<User[]>(
          "http://192.168.1.10:5111/api/simulation/"
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(getUsers, 2500);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const navigateToVitals = (user: User) => {
    router.push({
      pathname: "/admin/vitals",
      params: { user: JSON.stringify(user) },  
    });
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Utilisateurs</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.u_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.nom}</Text>
            <Text style={styles.cell}>{item.prenom}</Text>
            <Text style={styles.cell}>{formatDate(item.date_naiss)}</Text>
            <Text style={styles.cell}>{item.adress}</Text>
            <Text style={styles.cell}>{item.email}</Text>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => navigateToVitals(item)}
            >
              <Image
                source={require("../../assets/images/oeil.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerCell}>Nom</Text>
            <Text style={styles.headerCell}>Prénom</Text>
            <Text style={styles.headerCell}>Date de Naissance</Text>
            <Text style={styles.headerCell}>Adresse</Text>
            <Text style={styles.headerCell}>Email</Text>
            <Text style={styles.headerCell}>Détails</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  eyeButton: {
    flex: 1,
    alignItems: "center",
  },
});

export default Dashboard;
