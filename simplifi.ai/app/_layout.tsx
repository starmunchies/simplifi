import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index"
      options={{ headerShown: false }}
      />

  <Stack.Screen name="viewScreen"
        options={{ headerShown: false }}
        />

<Stack.Screen name="advancedSearch"
        options={{ headerShown: false }}
        />

    <Stack.Screen name="Screens"
        options={{ headerShown: false }}
        />
    </Stack>
  );
}