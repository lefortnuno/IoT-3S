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

// const BASE_URL = "http://192.168.1.10:5111/api/simulation/";
const BASE_URL = "https://iot-3s.onrender.com/api/simulation/";

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

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>(BASE_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
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
    if (user.u_id >= 4) {
      router.push({
        pathname: "/ios/vitals",
        params: { user: JSON.stringify(user) },
      });
    } else {
      router.push({
        pathname: "/arduino/vitals",
        params: { user: JSON.stringify(user) },
      });
    }
  };

  const navigateToAddUser = () => {
    router.push("/components/addUser");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registre des patients</Text>

      {/* Bouton Ajouter un utilisateur */}
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddUser}>
        <Text style={styles.addButtonText}>Nouveau</Text>
        <Image
          source={require("../../assets/images/ajouter.png")}
          style={styles.addIcon}
        />
      </TouchableOpacity>

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
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerCell}>Nom</Text>
            <Text style={styles.headerCell}>Prénom</Text>
            <Text style={styles.headerCell}>D. Naiss</Text>
            <Text style={styles.headerCell}>Adresse</Text>
            <Text style={styles.headerCell}>Email</Text>
            <Text style={styles.headerCell}>Détails</Text>
          </View>
        )}
      />

      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require("../../assets/images/medecine.jpg")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3,
  },
  headerCell: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  eyeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 120,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  imageContainer: {
    width: "100%",
    height: "40%",
    marginBottom: 10,
    overflow: "hidden",
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});

export default Dashboard;
