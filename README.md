# DaajuAI

Visit DaajuAI → https://daajuai.onrender.com/

⚠️ **Note:** This app is hosted on Render's free tier, which spins down after 15 minutes of inactivity. If the chatbot doesn't respond immediately, wait 20–30 seconds for the server to restart and try again.

A conversational AI chatbot built with Node.js and Express on the backend and vanilla JavaScript on the frontend. Powered by Gemini 2.5 Flash, with **persistent conversation memory** (MongoDB) and a **query-classification layer** that decides per-message whether live Google Search grounding is actually needed — instead of grounding every single response.

## Tech Stack

**Frontend**
- HTML5, CSS3, JavaScript (ES6+)
- marked.js for Markdown rendering

**Backend**
- Node.js, Express.js
- MongoDB (Atlas) + Mongoose for conversation persistence
- Google GenAI SDK (Gemini 2.5 Flash)
- Google Search grounding via Gemini API (invoked selectively)

## Features

- **Multi-turn conversation memory** — chat history is persisted per session in MongoDB, so follow-up questions ("what about in India?") resolve correctly instead of being answered in isolation
- **Smart query classification** — a two-tier classifier (regex heuristics + a lightweight Gemini fallback for ambiguous cases) decides whether a query needs real-time Search grounding or can be answered directly, reducing unnecessary grounded calls
- Source citations rendered below answers that use Search grounding
- Markdown rendering with code block support
- Typing indicator while response loads
- Auto-resizing textarea input
- XSS-safe message handling
- Fully responsive across mobile and desktop

## Getting Started

**Prerequisites:** Node.js, a Gemini API key, and a MongoDB Atlas connection string.

```bash
git clone https://github.com/joshidivyam/daaju-ai.git
cd daaju-ai
npm install
```

Create a `.env` file in the root directory:

```
GEMINI_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
```

Run the server:

```bash
node script_backend.js
```

Open http://localhost:3000 in your browser.

## Project Structure

```
daaju-ai
│
├── public
│   ├── index.html
│   ├── style.css
│   ├── script_frontend.js
│   └── sendButtonSvg.svg
│
├── models
│   └── Conversation.js
│
├── db.js
├── conversationService.js
├── queryClassifier.js
├── script_backend.js
├── .env
├── .gitignore
└── README.md
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |
| `MONGODB_URI` | MongoDB Atlas connection string (Connect → Drivers → Node.js) |

Ensure `.env` is in your `.gitignore` before pushing.

## How It Works

1. User sends a message along with a `sessionId` (generated once per page load).
2. The query classifier checks the message against static/dynamic patterns; ambiguous cases get a cheap secondary Gemini call.
3. Prior conversation turns are pulled from MongoDB and passed to Gemini as context.
4. Google Search grounding is attached only if the classifier determines the query needs current information.
5. Both the user message and the AI's reply are saved back to MongoDB for future turns.
