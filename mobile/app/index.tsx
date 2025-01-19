import * as Notifications from "expo-notifications";
import { Link } from "expo-router";
import React, { useEffect } from "react";
import { Text, Image, View, StyleSheet } from "react-native";

export default function Index() {
  useEffect(() => {
    const askForNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission not granted for notifications");
      }
    };

    askForNotificationPermission();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medical Health Care</Text>

      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require("../assets/images/doctor.jpg")}
        />
      </View>

      <Link href={"/ios/dashboard"} style={styles.button}>
        START
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 48,
    color: "#1E3A8A",
    fontFamily: "Georgia",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  imageContainer: {
    width: "100%",
    height: "50%",
    marginBottom: 30,
    overflow: "hidden",
    borderRadius: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  button: {
    fontSize: 18,
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    textAlign: "center",
    fontWeight: "bold",
    textDecorationLine: "none",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
