import { StyleSheet, View, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export function RecentTiles({ recentTiles, ...rest }) {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    //const navigation = useNavigation();
  
    return (
      <TouchableWithoutFeedback
        onPress={() => getItems('myArray', item)}
      >
        <Surface style={[styles.surface, item === "none" && styles.invisibleSurface]} elevation={4}>
          <Text style={item === "none" ? styles.invisibleText : null}>{item}</Text>
        </Surface>
      </TouchableWithoutFeedback>
    );
  };


  //itemKey : myArray
  //itemName : "none" or "filename"

  // redirect to view screen where the item is actually saved

  const getItems = async (itemKey, itemName) => {
    //console.log("itemKey: ",itemKey)
    //console.log("itemName: ",itemName);
    
    if (itemName === "none") {
      return null;
    } else {
      const storage = await AsyncStorage.getItem(itemKey);
      //console.log("Storage: ",storage)
      const parsedStorage = JSON.parse(storage);
  
      if (parsedStorage) {
        for (const item of parsedStorage) {
          console.log("Item: ",item)
          if (item.name === itemName) {
            // Assuming the view screen is named 'ItemViewScreen'
            console.log("Item found: ",item)
            // TODO create item view screen
            navigation.navigate('viewScreen', { item: item.data });
            
            break;
          }
          
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.square}>
      <Text style={styles.textHeader}>Recently Used</Text>
        <FlatList
          data={recentTiles}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.row}
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    padding: 10,
    marginHorizontal: -10,
  },
  surface: {
    flex: 1,
    margin: 20,
    padding: 12,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#D9D9D9',

  },
  textHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
  flatListContent: {
    paddingHorizontal: 10, // Add padding to the FlatList content
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  invisibleSurface: {
    opacity: 0, // Make the Surface invisible
  },
  invisibleText: {
    display: 'none', // Ensure the text is not displayed
  },
});

export default RecentTiles;
