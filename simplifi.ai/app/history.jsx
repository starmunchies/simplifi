import React, { useEffect, useState } from "react";
import { StyleSheet, View, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "react-native-paper";
import Svg, { LinearGradient, Text, Defs, Stop, TSpan } from "react-native-svg";
import { RecentTiles } from "@/components/flatlistDrawer";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker from Expo

import { Buffer } from "buffer";
import FormData from "form-data";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import config from "@/config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, MD2Colors, Modal } from "react-native-paper";

global.Buffer = Buffer;

export default function OnBoarding() {
  const navigation = useNavigation();
  const [recognizedText, setRecognizedText] = useState("");
  // Limit to six only MeansFile name can fit in the tile
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [recentTiles, setRecentTiles] = useState([]);
  const [refreshTiles, setRefreshTiles] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state


  const getArray = async (itemName) => {
    try {
      const existingArray = await AsyncStorage.getItem(itemName);
      if (existingArray !== null) {
        return JSON.parse(existingArray);
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const loadRecentTiles = async () => {
    const recentTiles = await getArray("myArray");
    //console.log(recentTiles);

    let tileNames = recentTiles.map((tile) => tile.name);
    tileNames = tileNames.reverse();
    const filledTiles =
      tileNames.length < 6
        ? [...tileNames, ...Array(6 - tileNames.length).fill("none")]
        : tileNames;

    //console.log(filledTiles);

    setRecentTiles(filledTiles);
  };

  useEffect(() => {
    loadRecentTiles();
  }, [refreshTiles]);

  useEffect(() => {
    loadRecentTiles();
  }, []);



  // Function to handle taking a photo


  // implement  wink nlp for gauge sentiment analysis
  // used to sentiment and also highlight important sentence in a document!!!!

  return (
    <View style={styles.container}>
     




      <View style={styles.recentTilesContainer}>
        <ThemedText style={styles.description}></ThemedText>
      </View>

      <RecentTiles recentTiles={recentTiles} />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  svgContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 5,
    justifyContent: "center",
  },
  description: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
  },
  button: {
    marginHorizontal: 10,
  },
  Crop: {
    marginTop: 100,
  },
  recentTilesContainer: {
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  CameraButtonContainer: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  Camerabutton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  CamerabuttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  CamerapermissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
    color: "white",
  },
  CamerapermissionButton: {
    alignSelf: "center",
  },
});
