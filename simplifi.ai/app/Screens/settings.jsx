import React from "react";
import { StyleSheet, Image, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";

import { List, Menu } from "react-native-paper";
import stockWelcome from "@/assets/images/stock-welcome.jpg";

// TODO finish the settings page
export default function OnBoarding() {
  const navigation = useNavigation();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={stockWelcome} style={styles.headerImage} />}
    >
      <ThemedText style={styles.description}>
        Settings
      </ThemedText>

      <View>
        <List.Item
          left={props => <List.Icon {...props} icon="history" color="white" />}
          onPress={() => {navigation.navigate("history");}}
          title="History"
          style={styles.menuItem}
          titleStyle={styles.menuItemText}
        />
         <List.Item
          left={props => <List.Icon {...props} icon="text-search" color="white" />}
          onPress={() => {navigation.navigate("history");}}
          title="Advanced Search"
          style={styles.menuItem}
          titleStyle={styles.menuItemText}
        />

        <List.Item
          left={props => <List.Icon {...props} icon="eye" color="white" />}
          onPress={() => { }}
          title="Terms Of Service"
          style={styles.menuItem}
          titleStyle={styles.menuItemText}
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: 350,
    resizeMode: "contain",
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: "#404040",
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    color: "#FFFFFF",
  },
  disabledText: {
    color: "#B0B0B0",
  },
});
