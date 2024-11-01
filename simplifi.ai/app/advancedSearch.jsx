import React from 'react';
import { StyleSheet, Image, View, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput, Button, Text, Provider as PaperProvider } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import stockWelcome from '@/assets/images/stock-welcome.jpg';
import config from "@/config.json";

export default function AdvancedSearch() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params; // Extract the item parameter
  const [selectedReadings, setSelectedReadings] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const READING_OPTIONS = [
    { label: 'Kindergarten', value: 'Kindergarten' },
    { label: 'Basic', value: 'Basic' },
    { label: 'Average', value: 'Average' },
    { label: 'Advanced', value: 'Advanced' },
    { label: 'College', value: 'College' },
    { label: 'Post-Grad', value: 'Post-Grad' },
  ];

  const TOPIC_OPTIONS = [
    { label: 'Science', value: 'Science' },
    { label: 'Math', value: 'Math' },
    { label: 'History', value: 'History' },
    { label: 'Literature', value: 'Literature' },
    { label: 'Legal Document', value: 'Legal Document' },
  ];


  const fetchSearchResults = async() => {
    // selectedReadings, selectedTopic, searchQuery

    let formData = {
        "reading": selectedReadings,
        "topic": selectedTopic,
        "prompt": searchQuery,
        "text": item.data
    } 
    // Fetch search results using await fetch()
    const response = await fetch(config["nodejsserv"] + '/advsearch', 
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        }
    );
    if (!response.ok) {
        console.log("Error fetching search results");
        return;
    }
    const data = await response.json();
    //console.log(data);
    navigation.navigate("viewScreen", { item: data });
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={stockWelcome} style={styles.headerImage} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Advanced Search</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.dropdownContainer}>
            <Dropdown
              label="Reading Grade"
              placeholder="Select Reading Grade"
              options={READING_OPTIONS}
              value={selectedReadings}
              onSelect={setSelectedReadings}
            />
          </View>
          <View style={styles.dropdownContainer}>
            <Dropdown
              label="General Topic"
              placeholder="Select Topic"
              options={TOPIC_OPTIONS}
              value={selectedTopic}
              onSelect={setSelectedTopic}
            />
          </View>
          <TextInput
            label="Additional Information"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={() => fetchSearchResults(item)}
            style={styles.button}
          >
            Search
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: 'black',
      padding: 16,
    },
    headerImage: {
        width: '100%',
        height: 210,
        resizeMode: 'cover',
    },
    headerTextContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    formContainer: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      elevation: 3, // for shadow effect
    },
    dropdownContainer: {
      marginBottom: 20,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 20,
    },
  });