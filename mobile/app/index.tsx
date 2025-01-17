import { Link } from "expo-router";
import { Text, Image, View, StyleSheet } from "react-native";

export default function Index() {
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

      <Link href={"/admin/dashboard"} style={styles.button}>
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
    backgroundColor: "#f8f9fa", // Light background color for a soft tone
  },
  title: {
    fontSize: 48,
    color: "#1E3A8A", // Dark blue for a professional feel
    fontFamily: "Georgia",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30, // Adds spacing between title and image
  },
  imageContainer: {
    width: "100%",
    height: "50%", // Adjusts the image height to make it more proportional
    marginBottom: 30,
    overflow: "hidden", // Ensures image doesn't overflow
    borderRadius: 15, // Smooth rounded corners
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15, // Ensures the image itself has rounded corners
  },
  button: {
    fontSize: 18,
    color: "#ffffff",
    backgroundColor: "#3b82f6", // Bright blue background for the button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded corners for the button
    textAlign: "center",
    fontWeight: "bold",
    textDecorationLine: "none", // Removed underline for a cleaner look
    shadowColor: "#000", // Adding shadow for 3D effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
});
