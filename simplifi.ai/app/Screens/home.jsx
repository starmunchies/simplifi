import React, { useEffect, useState } from "react";
import { StyleSheet, View, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "react-native-paper";
import Svg, { LinearGradient, Text, Defs, Stop, TSpan } from "react-native-svg";
import { RecentTiles } from "@/components/Drawer";
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

  const saveItem = async (newItem, itemName) => {
    try {
      // Retrieve the existing array
      const existingArray = await AsyncStorage.getItem(itemName);
      let newArray = [];

      if (existingArray !== null) {
        newArray = JSON.parse(existingArray);
      }

      // Add the new item to the array
      newArray.push(newItem);

      // Save the updated array back to AsyncStorage
      await AsyncStorage.setItem(itemName, JSON.stringify(newArray));
      setRefreshTiles((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

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

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    // TODO: Replace view with a dialog button for requesting the permission
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.CamerapermissionText}>
          We need your permission to show the camera
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.CamerapermissionButton}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  // Function handle file upload
  const handleUploadFile = async () => {
    try {
      console.log("document picker initialised");

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (result["canceled"] === false) {
        setLoading(true);
        const check = result["assets"][0];

        console.log("Selected PDF:", check.uri);

        const fileContents = await FileSystem.readAsStringAsync(check.uri, {
          encoding: FileSystem.EncodingType.Base64, // or FileSystem.EncodingType.Base64 depending on your needs
        });

        // load the pdf
        if (fileContents === null) {
          console.log("No file contents");
          return;
        } else {
          const payload = {
            filename: check.name,
            filetype: "application/pdf",
            base64: fileContents,
          };

          try {
            const formData = new FormData();
            formData.append("pdf", fileContents);
            formData.append("filename", check.name);

            const response = await fetch(config["nodejsserv"] + "/ocr/pdf", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();

              if (data["cancelled"] === false) {
                console.log(data);
                saveItem(
                  { data: data, type: "pdf", name: check.name },
                  "myArray"
                );
                saveItem(
                  { data: data, type: "pdf", name: check.name },
                  "proccess"
                );
                setLoading(false);
                //setRefreshTiles(!refreshTiles);
                navigation.navigate("viewScreen", { item: data });
              }
              console.log(data);
            }
          } catch (error) {
            console.error("Fetch ocr/pdf error: ", error);
          }
        }
      } else {
        console.log("Document picking was cancelled");
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };
  // Function to handle taking a photo
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access camera was denied");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      //console.log(result);
      if (result.canceled === false) {
        // Check if the result object contains the properties you expect
        setLoading(true);
        if (result["assets"][0].base64) {
          const base64String = result["assets"][0].base64;
          const base64Image = `data:image/jpeg;base64,${base64String}`;
          //console.log(base64Image);
          try {
            const formData = new FormData();
            formData.append("image", base64Image);

            const response = await fetch(config["nodejsserv"] + "/ocr", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              console.log(data);

              if (data["cancelled"] === false) {
                console.log(data);

                saveItem(
                  { data: data, type: "image", name: new Date().toISOString() },
                  "myArray"
                );

             

                saveItem(
                  { data: data, type: "image", name: new Date().toISOString() },
                  "proccess"
                );
                
                // Handle redirection to the view screen
                // add advance age search in next screen
                // add topic
                // add sentiment analysis for key words higlighted with yellow marker

                navigation.navigate("viewScreen", { item: data });
                //setRefreshTiles(!refreshTiles);

              } else {
                console.log("No text detected");
              }
              setLoading(false);
            }
          } catch (error) {
            console.error("Error performing OCR:", error);
            // Handle error gracefully (e.g., show error message to user)
          }
        } else {
          console.log("No image captured");
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  // implement  wink nlp for gauge sentiment analysis
  // used to sentiment and also highlight important sentence in a document!!!!

  return (
    <View style={styles.container}>
      <View style={styles.Crop}>
        <View style={styles.svgContainer}>
          <Svg viewBox="0 0 300 100" height="100" width="300">
            <Defs>
              <LinearGradient
                id="rainbow"
                x1="0"
                x2="0"
                y1="0"
                y2="100%"
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#FF5B99" offset="0%" />
                <Stop stopColor="#FF5447" offset="20%" />
                <Stop stopColor="#FF7B21" offset="40%" />
                <Stop stopColor="#EAFC37" offset="60%" />
                <Stop stopColor="#4FCB6B" offset="80%" />
                <Stop stopColor="#51F7FE" offset="100%" />
              </LinearGradient>
            </Defs>
            <Text fill="url(#rainbow)" textAnchor="middle">
              <TSpan fontSize="32" x="150" dy="32">
                Let's Scan A
              </TSpan>
              <TSpan fontSize="32" x="150" dy="40">
                Document
              </TSpan>
            </Text>
          </Svg>
        </View>
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <Button
              icon={({ color, size }) => (
                <Ionicons name="camera" color={color} size={size} />
              )}
              mode="contained"
              onPress={handleTakePhoto}
              style={styles.button}
            >
              Camera
            </Button>
            <Button
              onPress={handleUploadFile}
              icon={({ color, size }) => (
                <Ionicons
                  name="document-text-outline"
                  color={color}
                  size={size}
                />
              )}
              mode="contained"
              style={styles.button}
            >
              Upload
            </Button>
          </View>
        </View>
      </View>

      {loading && (
        <Modal
          transparent={true}
          animationType="none"
          visible={loading}
        >

          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size="large" />
          </View>
        </Modal>
      )}

      <ThemedText style={styles.description}>
        Simplifi.ai makes document comprehension easy by leveraging the power of
        Google Gemini to transform complex text into simple language.
      </ThemedText>

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
