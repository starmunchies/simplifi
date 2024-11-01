import React from "react";
import { StyleSheet, View, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Surface, Text, List } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export function RecentTiles({ recentTiles, ...rest }) {
  const navigation = useNavigation();

  const getItems = async (itemKey, itemName) => {
    if (itemName === "none") {
      return null;
    } else {
      const storage = await AsyncStorage.getItem(itemKey);
      const parsedStorage = JSON.parse(storage);
      if (parsedStorage) {
        for (const item of parsedStorage) {
          if (item.name === itemName) {
            navigation.navigate('viewScreen', { item: item.data });
            break;
          }
        }
      }
    }
  };

  const renderItem = ({ item }) => {
    if (item === "none") {
      return (
        <Surface style={styles.invisibleSurface}>
          <Text style={styles.invisibleText}>none</Text>
        </Surface>
      );
    }
    
    return (
      <List.Item
        left={props => <List.Icon {...props} icon="history" color="white" />}
        onPress={() => {getItems('myArray', item)}}
        title={item}
        style={styles.menuItem}
        titleStyle={styles.menuItemText}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.square}>
        <Text style={styles.textHeader}>Recently Used</Text>
        <FlatList
          data={recentTiles}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  square: {
    flex: 1,  // Ensures the square view stretches to fill the available space
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    padding: 10,
    marginHorizontal: -10,
  },
  surface: {
    flex: 1,
    margin: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#404040',
  },
  textHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
  flatListContent: {
    flexGrow: 1,  // Ensures the FlatList takes up available space
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  invisibleSurface: {
    opacity: 0,
  },
  menuItemText: {
    color: '#FFFFFF',
  },
  menuItem: {
    backgroundColor: '#404040',
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  invisibleText: {
    display: 'none',
  },
});

export default RecentTiles;
