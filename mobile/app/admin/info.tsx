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
    <View>
      <Text style={styles.title}>Information Santé </Text>
      <Text style={styles.description}>
        Le patient{" "}
        <Text style={styles.bbold}>
          {user.nom} {user.prenom}
        </Text>
        , {user.sexe ? "né" : "née"} le {formatDate(user.date_naiss)} (
        <Text style={styles.bbold}>{age} ans</Text>), résidant à {user.adress},
        est{" "}
        <Text style={styles.bbold}>
          {user.coms ? "malade" : "en bonne santé"}
        </Text>
        . Adresse Email : <Text style={styles.bbold}>{user.email}</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
  },
  bbold: {
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    textAlign: "left",
    marginVertical: 10,
    color: "#333",
  },
});
