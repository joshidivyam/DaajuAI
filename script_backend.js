require("dotenv").config();
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const connectDB = require("./db");
const conversationService = require("./conversationService");
const { classifyQuery } = require("./queryClassifier");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

connectDB();

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId;

    if (!userMessage || typeof userMessage !== "string" || userMessage.trim() === "") {
      return res.status(400).json({ reply: "Empty message received." });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ reply: "Missing sessionId." });
    }

    const trimmedMessage = userMessage.trim();

    // 1. Decide if this query needs live Search grounding
    const { useSearch, method } = await classifyQuery(ai, trimmedMessage);

    // 2. Build contents array: prior turns from Mongo + this new message
    const contents = await conversationService.toGeminiContents(sessionId, trimmedMessage);

    // 3. Only attach the search tool when the classifier says it's needed
    const requestConfig = {
      model: "gemini-2.5-flash",
      contents,
    };
    if (useSearch) {
      requestConfig.config = { tools: [{ googleSearch: {} }] };
    }

    const response = await ai.models.generateContent(requestConfig);
    const reply = response.text;

    const metadata = response.candidates[0]?.groundingMetadata;
    const sources = useSearch
      ? metadata?.groundingChunks
          ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
          .map(chunk => ({
            title: chunk.web.title,
            url: chunk.web.uri
          })) || []
      : [];

    // 4. Persist both turns to Mongo
    await conversationService.addMessage(sessionId, "user", trimmedMessage, useSearch);
    await conversationService.addMessage(sessionId, "assistant", reply, useSearch);

    return res.json({ reply, sources, usedSearch: useSearch, classifiedBy: method });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ reply: "Something went wrong. Try again!" });
  }
});

app.post("/clear-session", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ ok: false });
  await conversationService.clearSession(sessionId);
  return res.json({ ok: true });
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
