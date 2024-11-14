import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Collapsible } from '@/components/Collapsible';
import stockWelcome from '@/assets/images/stock-welcome.jpg';
import { Button } from 'react-native-paper';
import Svg, {
  LinearGradient,
  Text,
  Defs,
  Stop,
  TSpan
} from 'react-native-svg';

export default function OnBoarding() {
  const navigation = useNavigation();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Image source={stockWelcome} style={styles.headerImage} />}
    >
      <View style={styles.svgContainer}>
        <Svg viewBox="0 0 300 100" height="100" width="300">
          <Defs>
            <LinearGradient id="rainbow" x1="0" x2="0" y1="0" y2="100%" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#FF5B99" offset="0%" />
              <Stop stopColor="#FF5447" offset="20%" />
              <Stop stopColor="#FF7B21" offset="40%" />
              <Stop stopColor="#EAFC37" offset="60%" />
              <Stop stopColor="#4FCB6B" offset="80%" />
              <Stop stopColor="#51F7FE" offset="100%" />
            </LinearGradient>
          </Defs>
          <Text fill="url(#rainbow)" textAnchor="middle">
            <TSpan fontSize="32" x="150" dy="32">Welcome to</TSpan>
            <TSpan fontSize="32" x="150" dy="40">Simplifi.ai</TSpan>
          </Text>
        </Svg>
      </View>

      <ThemedText style={styles.description}>
        Simplifi.ai makes document comprehension easy by leveraging the power of Google Gemini to
        transform complex text into simple language.
      </ThemedText>
      
      <Collapsible title="Capture or Upload Documents">
        <ThemedText>
          Use your camera to take pictures of documents or upload them directly from your device.
          Simplifi.ai will process the text instantly.
        </ThemedText>
      </Collapsible>

      <Collapsible title="AI-Powered Simplification">
        <ThemedText>
          Our advanced AI engine, Google Gemini, simplifies the language of your documents, making
          it accessible for everyone.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Ideal for All Users">
        <ThemedText>
          Simplifi.ai is designed to help individuals with various needs:
        </ThemedText>
        <ThemedText>
          Our mission is to make information accessible to everyone, regardless of their reading
          or language skills.
        </ThemedText>
      </Collapsible>

      <View style={styles.buttonContainer}>
        <Button icon="rocket" mode="contained" onPress={() => navigation.navigate('Screens' as never)}>
          Get started
        </Button>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%', // Use a percentage of the parent width for responsiveness
    height: 350, // Adjust the height as needed to fit within the header
    resizeMode: 'contain', // Ensure the entire image fits within the header
  },
  svgContainer: {
    alignItems: 'center',
    marginTop: 20, // Adjust as needed to reduce whitespace
    marginBottom: 20, // Adjust as needed to reduce whitespace
    justifyContent: 'center',
    
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
