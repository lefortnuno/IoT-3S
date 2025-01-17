import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface User {
  nom: string;
  prenom: string;
  adress: string;
  date_naiss: string;
  email: string;
  sexe: boolean;
  sante: boolean;
  libelle: string;
  spec: string;
}

interface InfoProps {
  user: User;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
};

export default function Info({ user }: InfoProps) {
  const age = calculateAge(user.date_naiss);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Information Santé</Text>
      <Text style={styles.description}>
        Le patient{" "}
        <Text style={styles.bold}>
          {user.nom} {user.prenom}
        </Text>
        , {user.sexe ? "né" : "née"} le {formatDate(user.date_naiss)} (
        <Text style={styles.bold}>{age} ans</Text>), résidant à{" "}
        <Text style={styles.bold}>{user.adress}</Text>, est{" "}
        <Text style={styles.bold}>
          {user.sante ? "en bonne santé" : "malade"}
        </Text>
        .
      </Text>
      <Text style={styles.description}>
        Adresse Email : <Text style={styles.bold}>{user.email}</Text>.
      </Text>
      <Text style={styles.description}>
        Appareil : <Text style={styles.bold}>{user.libelle}</Text> {user.spec}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f7fb",  
    borderRadius: 5,
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,  
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",  
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#2980b9", 
  },
  description: {
    fontSize: 16,
    color: "#34495e",  
    lineHeight: 24,  
    textAlign: "left",
    marginTop: 5,
  },
});
