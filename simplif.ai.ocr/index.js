const express = require("express");
const { createWorker } = require("tesseract.js");
const bodyParser = require("body-parser");
const multer = require("multer");
const { PDFDocument, blobToUint8Array } = require("pdf-lib");
const pdf = require("pdf-parse");
const blobUtil = require("blob-util");
const spellchecker = require("spellchecker");
const dotenv = require("dotenv");
const upload = multer({
  limits: {
    fieldSize: 25 * 1024 * 1024, // Increase field size limit to 25 MB
  },
}); // Setup multer instance
const { GoogleGenerativeAI } = require("@google/generative-ai");
const  Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");


const app = express();
const port = 5080;

app.use(express.json());
app.use(bodyParser.json({ limit: "20MB" }));
//import key from .env file
dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("hello");
});

app.post("/analysis", async (req, res) => { 
  // ext pre sliced text
  try{
  const {text} = req.body;

  const result = await analyzer.getSentiment(text)
  console.log(result);

  if (result > 0) {
    res.status(200).json({ data: "Positive", cancelled: false });
  }else if (result < 0) {
    res.status(200).json({ data: "Negative", cancelled: false });
  }else if (result == 0) {
    res.status(200).json({ data: "Neutral", cancelled: false });
  }else{
    res.status(400).json({ data: "Error", cancelled: true });
  }
}catch (error) {
  console.error("Error during Analysis processing:", error);
  res.status(500).json({ data: "Internal Server Error", cancelled: true });
}
});

app.post("/ocr", upload.single("image"), async (req, res) => {
  // Initialize the Tesseract.js worker

  try {
    // Convert the uploaded file to a base64-encoded string if it's a file upload
    const base64Image = req.body.image;
    // Alternatively, if it's already a base64 string in the body, you can directly use req.body.image
    // const base64Image = req.body.image;

    console.log("initialising worker");
    const worker = await createWorker("eng");
    console.log("Recognising Text");
    const {
      data: { text },
    } = await worker.recognize(base64Image);
    const ret = { data: text };
    console.log("Terminating Worker");
    try {
      await worker.terminate();
    } catch (e) {
      console.log("Error terminating worker: ", e);
    }

    if (text) {
      const test = await AIprompt(text);
      res.status(200).json({ data: test, cancelled: false });
    } else {
      res
        .status(400)
        .json({ data: "OCR failed no text detected", cancelled: true });
    }
  } catch (error) {
    console.error("Error during OCR processing:", error);
    res.status(500).json({ data: "Internal Server Error", cancelled: true });
  }
});

app.post("/ocr/pdf", upload.single("pdf"), async (req, res) => {
  try {
    const base64 = req.body.pdf;

    const pdfBuffer = await Buffer.from(base64, "base64");

    try {
      const data = await pdf(pdfBuffer);

      const text = processExtractedText(data.text);
      // PDF info
      console.log(data.info);
      // PDF metadata
      if (data.metadata != null) {
        console.log(data.metadata);
      }

      
      // Respond with text extracted from the PDF (or do other processing) */
      const test = await AIprompt(text);
      res.status(200).json({ data: test, cancelled: false });
    } catch (err) {
      console.error("Error in ocr/pdf parsing: ", err);
      res.status(400).json({ data: err, cancelled: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ data: err, cancelled: true });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

function processExtractedText(text) {
  // Example of cleaning up whitespace
  let cleanedText = text.replace(/\s+/g, " ").trim();

  // Example of correcting common OCR errors (e.g., replacing "1" with "I")
  //cleanedText = cleanedText.replace(/\b1\b/g, "I");

  // Spell-check the text and correct errors
  cleanedText = handleMixedCharacters(cleanedText);
  const words = cleanedText.split(" ");
  const correctedWords = words.map((word) => {
    if (spellchecker.isMisspelled(word)) {
      const suggestions = spellchecker.getCorrectionsForMisspelling(word);
      return suggestions.length > 0 ? suggestions[0] : word;
    }
    return word;
  });

  return correctedWords.join(" ");
}

function handleMixedCharacters(text) {
  // Regular expression to match sequences of numbers surrounded by letters
  const regex = /([A-Za-z])\d+([A-Za-z])/g;

  // Replace numbers based on context
  const correctedText = text.replace(regex, (match, leftChar, rightChar) => {
    // Check if there's a letter on either side
    if (leftChar && rightChar) {
      // Replace the number with the letter to its left
      return leftChar + match.slice(1, -1) + rightChar;
    } else if (leftChar) {
      // Replace with the letter on the left
      return leftChar + match.slice(1);
    } else if (rightChar) {
      // Replace with the letter on the right
      return match.slice(0, -1) + rightChar;
    } else {
      // Default: return the match unchanged if no letters found on either side
      return match;
    }
  });

  return correctedText;
}

app.post("/advsearch", async (req, res) => {
  const { reading, topic, prompt, text } = req.body;


  console.log("init adv worker");
  
  try {
    const test = await AIpromptADV(text, reading, topic, prompt);
    res.status(200).json({ data: test, cancelled: false });

  } catch (error) {

    console.error("Error during processing ADV Search:", error);
    res.status(500).json({ data: "Internal Server Error", cancelled: true });
  }
});

const AIprompt = async function (text) {
  //TODO implement the AI model GEMINI
  // api key
  const apiKey = process.env.GLC;

  const genAI = new GoogleGenerativeAI(apiKey);

  //console.log(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    `
  You are an llm with the task of simplify complex language the age of understanding as a 12 year old. Follow these guidline below and return the text and nothing but the text.
  • Use breaks: Break up information with breaks where appropriate.
  • Express positively: Instead of saying what something isn't, say what it is. For example, say "The office is open in the mornings only" instead of "The office is not open in the afternoons".
  • Avoid technical terms: Do not use words that are hard to understand. For example, use simple words instead of abbreviations or jargon.
  • Avoid contractions: Instead of using words like "don't" or "can't", use the full words like "do not" or "cannot". For example, say "for example" instead of "e.g.".
  • Avoid figurative language: Do not use phrases that are not clear. For example, do not say "at the end of the day" or "basically".
  • Use simple quantities: Instead of exact numbers, use general terms like "a few" or "a lot".
  • Use numerals for numbers: When you write numbers, use digits (like 7) instead of words (like seven). For example, say "Each group has 7 people" instead of "Each group has seven people".
  • Follow national guidelines: When you write information, think about guidelines that are made for everyone to understand. For example, you can follow guidelines from the Citizens Information Board.
  • Remember to return it as markdown text for ease of reading.
  : ` + text;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const textme = response.text();

  console.log(textme);

  //return the corrected text
  return textme;
};

const AIpromptADV = async function (text, reading, topic, prmpt) {
  //TODO implement the AI model GEMINI
  // api key
  const apiKey = process.env.GLC;

  const genAI = new GoogleGenerativeAI(apiKey);

  //console.log(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    `
  You are an llm with the task of simplify complex language the age of understanding as a 12 year old. Follow these guidline below and return the text and nothing but the text.
  • Use breaks: Break up information with breaks where appropriate.
  • Express positively: Instead of saying what something isn't, say what it is. For example, say "The office is open in the mornings only" instead of "The office is not open in the afternoons".
  • Avoid technical terms: Do not use words that are hard to understand. For example, use simple words instead of abbreviations or jargon.
  • Avoid contractions: Instead of using words like "don't" or "can't", use the full words like "do not" or "cannot". For example, say "for example" instead of "e.g.".
  • Avoid figurative language: Do not use phrases that are not clear. For example, do not say "at the end of the day" or "basically".
  • Use simple quantities: Instead of exact numbers, use general terms like "a few" or "a lot".
  • Use numerals for numbers: When you write numbers, use digits (like 7) instead of words (like seven). For example, say "Each group has 7 people" instead of "Each group has seven people".
  • Follow national guidelines: When you write information, think about guidelines that are made for everyone to understand. For example, you can follow guidelines from the Citizens Information Board.
  • Remember to return it as markdown text for ease of reading.
  : ` +
    text +
    "set the reading level to: " +
    reading +
    "and the topic to: " +
    topic +
    "and the extra info passed by user" +
    prmpt;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const textme = response.text();

  console.log(textme);

  //return the corrected text
  return textme;
};
