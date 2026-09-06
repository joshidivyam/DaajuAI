// conversationService.js
const Conversation = require("./models/Conversation");

async function getOrCreateSession(sessionId) {
  let convo = await Conversation.findOne({ sessionId });
  if (!convo) {
    convo = await Conversation.create({ sessionId, messages: [] });
  }
  return convo;
}

async function addMessage(sessionId, role, text, usedSearch = false) {
  const convo = await getOrCreateSession(sessionId);
  convo.pushMessage(role, text, usedSearch);
  await convo.save();
  return convo;
}

async function getHistory(sessionId) {
  const convo = await Conversation.findOne({ sessionId });
  return convo ? convo.messages : [];
}

// Gemini's generateContent accepts a plain string OR an array of
// { role, parts: [{ text }] } turns. We build that array here.
async function toGeminiContents(sessionId, newUserMessage) {
  const history = await getHistory(sessionId);
  const historyContents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));
  return [...historyContents, { role: "user", parts: [{ text: newUserMessage }] }];
}

async function clearSession(sessionId) {
  await Conversation.deleteOne({ sessionId });
}

module.exports = {
  getOrCreateSession,
  addMessage,
  getHistory,
  toGeminiContents,
  clearSession,
};
