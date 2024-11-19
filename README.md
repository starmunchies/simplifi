# Simplifi.ai

**Simplifi.ai** is a mobile application developed with React Native to simplify complex text, emails, and documents, including academic and legal materials. 
With Simplifi.ai, users can input or upload text, and the app will return a simplified, easy-to-understand version. 
This app uses Natural Language Processing (NLP) techniques and OCR for processing documents.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Future Work](#future-work)


---

## Features
- **Text Simplification**: Users can input or paste complex text and receive simplified output.
- **Advanced Search**: Users can input and update the area of topic with additional information about the text.
- **Read Aloud**: Enables Text to speech of the simplified document.
- **Sentiment Analysis**: Allows User to gauge if the text has a positive or negative sentiment.
- **Document Upload and OCR**: Upload PDFs or images, and the app will extract text using OCR and simplify it.
- **Email Simplification**: Upload email text to get a simplified version.
- **Document History**: Access previously simplified documents for quick reference.

---

## Tech Stack
- **Frontend**: React Native,
    •	Wink-NLP:  To implement sentiment analysis on the submitted document
    •	React-Native-Paper: UI Library to make everything a tad bit more user friendly
    •	Expo-speech: Text To Speech tool to read out the simplified document
    •	React-Native-Markdown-Renderer: Renders the returned document in markdown for easy reading .

- **Backend**: Node.js and Express
    •	Multer: Used to upload large files such as images and PDF’s like we are doing.
    •	tesseract.js: Scans in an image and returns the text for us to parse
    •	Spellchecker: Fix any common spelling mistakes made by the tesseract.js.
    •	@google/generative-ai: Googles LLM model library to interact with Gemini (1.5 Flash)
    •	pdf-parse:  To parse any of the text out of any pdf uploaded.

- **Cloud Provider**: Google Cloud

---

## Future Work
Looking ahead, I plan to move away from hosted LLM services and explore running local models through services such as OLlama. While I currently lack the necessary hardware for local fine-tuning, I’m exploring services like Runpod to handle this process. Fine-tuning would enable me to better tailor the models to user needs as well as experiment with agent frameworks such as bee-agent to enhance the tooling and error handling of LLMs.

YouTube Demo : https://youtube.com/shorts/5T0mWcr-nx8?feature=share
