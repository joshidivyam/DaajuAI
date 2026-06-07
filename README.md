
<img width="1499" height="910" alt="image" src="https://github.com/user-attachments/assets/fe72addb-b029-46f4-8217-47f461ad56b5" />

visit DaajuAI->https://daajuai.onrender.com/

# DaajuAI

A conversational AI chatbot built with Node.js and Express on the backend and vanilla JavaScript on the frontend. Powered by Gemini 2.5 Flash with real-time Google Search grounding — responses reflect current information, not just training data. Each answer includes citations linking back to the sources used.

---

## Tech Stack

**Frontend**
- HTML5, CSS3, JavaScript (ES6+)
- marked.js for Markdown rendering

**Backend**
- Node.js, Express.js
- Google GenAI SDK (Gemini 2.5 Flash)
- Google Search grounding via Gemini API

---

## Features

- Real-time web search grounding on every response
- Source citations rendered below each answer
- Markdown rendering with code block support
- Typing indicator while response loads
- Auto-resizing textarea input
- XSS-safe message handling
- Fully responsive across mobile and desktop

---

## Getting Started

**Prerequisites:** Node.js and a [Gemini API key](https://aistudio.google.com/app/apikey)

```bash
git clone https://github.com/joshidivyam/daaju-ai.git
cd daaju-ai
npm install
```

Create a `.env` file in the root directory:

GEMINI_API_KEY=your_api_key_here

Run the server:

```bash
node script_backend.js
```

Open `http://localhost:3000` in your browser.

---

## Project Structure
daaju-ai/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script_frontend.js
│   └── sendButtonSvg.svg
├── script_backend.js
├── .env
├── .gitignore
└── README.md

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |

Ensure `.env` is in your `.gitignore` before pushing.

---


**Divyam Joshi**
[GitHub](https://github.com/joshidivyam) · [LinkedIn](https://linkedin.com/in/divyamjoshi)
