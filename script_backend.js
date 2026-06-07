require("dotenv").config();
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string" || userMessage.trim() === "") {
      return res.status(400).json({ reply: "Empty message received." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage.trim(),
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const reply = response.text;

    const metadata = response.candidates[0]?.groundingMetadata;
    const sources = metadata?.groundingChunks
      ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => ({
        title: chunk.web.title,
        url: chunk.web.uri
      })) || [];

    return res.json({ reply, sources });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ reply: "Something went wrong. Try again!" });
  }
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
