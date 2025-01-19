import { View, Text, StyleSheet } from "react-native";

export default function Adduser() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Patient</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    paddingLeft: 20,
  },
});
