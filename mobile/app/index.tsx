import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World!</Text>
      <Link href={"/about"} style={styles.button}>
        Apropos
      </Link> 
      <Link href={"/admin/dashboard"} style={styles.button}>
        Users List
      </Link>
      <Link href={"/admin/stats"} style={styles.button}>
        Stat Users
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    // #25292e
  },
  text: {
    fontSize: 48,
    color: "#00008D",
    fontFamily: "Georgia",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#000",
  },
});
