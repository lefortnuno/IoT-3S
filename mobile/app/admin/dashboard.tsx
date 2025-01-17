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
    router.push({
      pathname: "/admin/vitals",
      params: { user: JSON.stringify(user) },
    });
  };

  const navigateToAddUser = () => {
    router.push("/admin/addUser"); // Modifier l'URL de la page d'ajout d'utilisateur
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Utilisateurs</Text>

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
            <Text style={styles.headerCell}>Birthday</Text>
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
    backgroundColor: "#f8f9fa", // Légère couleur de fond
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A", // Bleu sombre pour un look professionnel
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#1E3A8A", // Fond bleu clair pour l'en-tête
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3, // Ombre pour effet 3D
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
    elevation: 4, // Ombre pour effet 3D sur les lignes
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
    flexDirection: "row", // Aligner le texte et l'image horizontalement
    alignItems: "center", // Centrer verticalement
    justifyContent: "center", // Centrer horizontalement
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
    marginLeft: 10, // Espacement entre le texte et l'icône
  },
});

export default Dashboard;
