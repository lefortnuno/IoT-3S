import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface User {
  nom: string;
  prenom: string;
  adress: string;
  date_naiss: string;
  email: string;
  sexe: boolean;
  coms: string;
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
          {user.coms ? "malade" : "en bonne santé"}
        </Text>
        . Adresse Email :{" "}
        <Text style={styles.bold}>{user.email}</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f7fb", // Couleur de fond douce
    borderRadius: 10,
    shadowColor: "#000", // Ombre douce autour du conteneur
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Effet de profondeur
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50", // Couleur de titre plus foncée pour contraste
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#2980b9", // Couleur bleu clair pour les mots importants
  },
  description: {
    fontSize: 16,
    color: "#34495e", // Texte gris clair pour une bonne lisibilité
    lineHeight: 24, // Améliorer l'interligne pour rendre le texte plus aéré
    textAlign: "left",
    marginTop: 10,
  },
});
