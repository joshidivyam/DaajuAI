// models/Conversation.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    usedSearch: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

const MAX_TURNS = 20;
conversationSchema.methods.pushMessage = function (role, text, usedSearch = false) {
  this.messages.push({ role, text, usedSearch });
  if (this.messages.length > MAX_TURNS) {
    this.messages = this.messages.slice(-MAX_TURNS);
  }
};

module.exports = mongoose.model("Conversation", conversationSchema);
