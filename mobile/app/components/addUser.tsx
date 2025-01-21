import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";

// const BASE_URL_LOCAL = "http://192.168.1.10:5111/api/simulation/";
const BASE_URL = "https://iot-3s.onrender.com/api/simulation/";

export default function AddUser() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    date_naiss: "",
    sexe: true,
    sante: true,
    adress: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (
      !form.nom ||
      !form.prenom ||
      !form.date_naiss ||
      !form.adress ||
      !form.email
    ) {
      Alert.alert(
        "Erreur",
        "Tous les champs obligatoires doivent être remplis."
      );
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}user/`, form);
      if (response.status === 201) {
        Alert.alert("Succès", "Le patient a été ajouté avec succès.");
        setForm({
          nom: "",
          prenom: "",
          date_naiss: "",
          sexe: true,
          sante: true,
          adress: "",
          email: "",
        });
      } else {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de l'ajout du patient."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient :", error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Patient</Text>

      <ScrollView>
        {/* Nom et Prénom dans une seule ligne */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Nom :</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={form.nom}
              onChangeText={(text) => handleInputChange("nom", text)}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Prénom :</Text>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={form.prenom}
              onChangeText={(text) => handleInputChange("prenom", text)}
            />
          </View>
        </View>

        <View style={styles.column2}>
          <Text style={styles.label}>Date de naissance :</Text>
          <TextInput
            style={styles.input}
            placeholder="Date de naissance (YYYY-MM-DD)"
            value={form.date_naiss}
            onChangeText={(text) => handleInputChange("date_naiss", text)}
            keyboardType="numeric"
          />
        </View>

        {/* Sexe */}
        <View style={styles.radioGroup}>
          <Text style={styles.label}>Sexe :</Text>
          <TouchableOpacity
            style={[styles.radioButton, form.sexe && styles.radioSelected]}
            onPress={() => handleInputChange("sexe", true)}
          >
            <Text style={styles.radioText}>Homme</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, !form.sexe && styles.radioSelected]}
            onPress={() => handleInputChange("sexe", false)}
          >
            <Text style={styles.radioText}>Femme</Text>
          </TouchableOpacity>
        </View>

        {/* État de santé */}
        <View style={styles.radioGroup}>
          <Text style={styles.label}>État de santé :</Text>
          <TouchableOpacity
            style={[styles.radioButton, form.sante && styles.radioSelected]}
            onPress={() => handleInputChange("sante", true)}
          >
            <Text style={styles.radioText}>Bonne santé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, !form.sante && styles.radioSelected]}
            onPress={() => handleInputChange("sante", false)}
          >
            <Text style={styles.radioText}>Malade</Text>
          </TouchableOpacity>
        </View>

        {/* Adresse et Email dans une seule ligne */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Adresse :</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={form.adress}
              onChangeText={(text) => handleInputChange("adress", text)}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Bouton Ajouter */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Ajouter</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require("../../assets/images/sante-maroc.jpg")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  column2: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 15,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 15,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: "#ffffff",
  },
  radioSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  radioText: {
    fontSize: 16,
    color: "#333333",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
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
