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
        name="admin/vitals"
        options={{
          headerTitle: "Vitals",
        }}
      />
      <Stack.Screen
        name="admin/dashboard"
        options={{
          headerTitle: "Dashboard",
        }}
      />
      <Stack.Screen
        name="admin/stats"
        options={{
          headerTitle: "Stats",
        }}
      />
    </Stack>
  );
}
