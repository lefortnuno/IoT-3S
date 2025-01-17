import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Trofel",
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerTitle: "Apropos",
        }}
      />
      
      <Stack.Screen
        name="ios/vitals"
        options={{
          headerTitle: "Vitals",
        }}
      />
      <Stack.Screen
        name="ios/dashboard"
        options={{
          headerTitle: "Dashboard",
        }}
      />
      <Stack.Screen
        name="components/stats"
        options={{
          headerTitle: "Stats",
        }}
      />
    </Stack>
  );
}
