import React from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import Markdown from "react-native-markdown-renderer";
import { Button, Chip } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import stockWelcome from "@/assets/images/stock-welcome.jpg";
import * as Speech from "expo-speech";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import config from "@/config.json";

export default function OnBoarding() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params; // Extract the item parameter
  const [speaking, setSpeaking] = React.useState(false);
  const [sentiment, setSentiment] = React.useState('');

  const stripMarkdown = (text) => {
    // Remove headers
    text = text.replace(/^#{1,6}\s+/gm, "");
    // Remove bold and italic
    text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
    text = text.replace(/(\*|_)(.*?)\1/g, "$2");
    // Remove inline code
    text = text.replace(/`([^`]+)`/g, "$1");
    // Remove blockquotes
    text = text.replace(/^\s*>+\s?/gm, "");
    // Remove links
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "");
    // Remove horizontal rules
    text = text.replace(/^-{3,}$/gm, "");
    // Remove list bullets
    text = text.replace(/^\s*[\*\+\-]\s+/gm, "");
    // Remove numbered lists
    text = text.replace(/^\s*\d+\.\s+/gm, "");
    // Remove tables
    text = text.replace(/^\|(.+\|)+\s*$/gm, "");
    text = text.replace(/^\s*\|?\s*\-+\s*\|?\s*$/gm, "");
    return text;
  };

  const markup = (item) => {
    // Instantiate winkNLP.
    const nlp = winkNLP(model);
    const its = nlp.its; // Access `its` through `wink-nlp`
    const as = nlp.as; // Access `as` through `wink-nlp`

    const doc = nlp.readDoc(item.data);
    doc.entities().each((e) => e.markup());

    const ret = doc.out(its.markedUpText);
    return replaceMarkTags(ret);
  };
  const replaceMarkTags = (text) => {
    const regex = /<mark>(.*?)<\/mark>/g;
    const replacedText = text.replace(regex, "==$1==");
    return replacedText;
  };

  const sentimentAnalysis = async () => {
    const response = await fetch(config["nodejsserv"] + "/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: item.data.split(" ") }),
    });
    if (!response.ok) {
      console.log("Error fetching search results");
      return;
    }
    const data = await response.json();
    console.log(data.data);
    setSentiment(data.data);

    // getSentiment expects an array of strings

    ///console.log("Starting Analysis....................");
    ///console.log(analyzer.getSentiment(item.data.split(" ")));
    ///console.log("Ending Analysis....................");
  };

  const handleReadAloud = () => {
    setSpeaking(!speaking);

    if (speaking) {
      Speech.stop();
      return;
    }

    const cleanText = stripMarkdown(item.data);

    const chunks = cleanText.match(/[\s\S]{1,4000}/g) || [];

    const speakChunks = (index) => {
      if (index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      Speech.speak(chunks[index], {
        onDone: () => speakChunks(index + 1),
        onStopped: () => setSpeaking(false),
      });
    };

    speakChunks(0);
  };

  //markup(item);
  sentimentAnalysis();
  // TODO
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={stockWelcome} style={styles.headerImage} />}
    >
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("advancedSearch", { item: item })}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Advanced </Text>
            <Ionicons
              name="search"
              size={16}
              color="white"
              style={styles.icon}
            />
          </View>
        </Button>

        <Button
          mode="contained"
          onPress={handleReadAloud}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Read Aloud</Text>
            <Ionicons
              name="volume-high"
              size={16}
              color="white"
              style={styles.icon}
            />
          </View>
        </Button>
      </View>
    {sentiment !== "" && 
        <View style={styles.sentimentContainer}>
        <Text style={styles.descriptext}>Sentiment Analysis: </Text>
        <Chip icon="information" onPress={() => console.log('Pressed')}>{sentiment}</Chip>
        </View>
        }
        
      <Markdown style={markdownStyles}>{item.data}</Markdown>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%", // Use a percentage of the parent width for responsiveness
    height: 350, // Adjust the height as needed to fit within the header
    resizeMode: "cover", // Ensure the image covers the header area
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sentimentContainer: {
    flexDirection: 'row',  // Arrange children in a row
    alignItems: 'center',  // Align items vertically centered
    marginVertical: 10, 
  },

  description: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF", // White text color
  },
  buttonContainer: {
    flexDirection: "row", // Align buttons side by side
    marginTop: 20,
    alignItems: "center",
    marginLeft: -40,
    marginBottom: 20,
  },
  button: {
    width: "50%", // Adjust the width as needed
    marginHorizontal: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
  },
  descriptext: {
    marginRight: 10,
    color: "#FFFFFF", // White text color
  },

  icon: {
    marginLeft: 8, // Ensure there's space between text and icon
  },
});

const markdownStyles = {
  text: {
    color: "#FFFFFF", // White text color for markdown content
    fontSize: 16, // Adjust font size
    lineHeight: 24, // Adjust line height for better readability
  },
  heading1: {
    color: "#FFFFFF", // White text color for headings
    fontSize: 28, // Adjust font size for H1
    fontWeight: "bold", // Bold for emphasis
    marginVertical: 10, // Space above and below heading
  },
  heading2: {
    color: "#FFFFFF", // White text color for headings
    fontSize: 24, // Adjust font size for H2
    fontWeight: "bold", // Bold for emphasis
    marginVertical: 8, // Space above and below heading
  },
  heading3: {
    color: "#FFFFFF", // White text color for headings
    fontSize: 20, // Adjust font size for H3
    fontWeight: "bold", // Bold for emphasis
    marginVertical: 6, // Space above and below heading
  },
  bullet_list: {
    color: "#FFFFFF", // White text color for bullet points
    paddingLeft: 20, // Indent bullet points
    marginVertical: 6, // Space above and below list
  },
  list_item: {
    color: "#FFFFFF", // White text color for list items
    fontSize: 16, // Adjust font size
    lineHeight: 24, // Adjust line height
    marginVertical: 4, // Space above and below list items
  },
  blockquote: {
    color: "#FFFFFF", // White text color for blockquotes
    fontStyle: "italic", // Italicize blockquotes
    backgroundColor: "#444444", // Background color for blockquotes
    padding: 10, // Padding inside blockquotes
    marginVertical: 8, // Space above and below blockquotes
    borderLeftWidth: 4, // Left border width for blockquotes
    borderLeftColor: "#888888", // Left border color for blockquotes
  },
  code_block: {
    color: "#FFFFFF", // White text color for code blocks
    backgroundColor: "#333333", // Background color for code blocks
    padding: 10, // Padding inside code blocks
    borderRadius: 4, // Rounded corners for code blocks
    fontFamily: "monospace", // Monospace font for code
    marginVertical: 8, // Space above and below code blocks
  },
  link: {
    color: "#1E90FF", // Blue color for links
    textDecorationLine: "underline", // Underline links
  },
  // Add more styles as needed
};
