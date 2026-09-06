// queryClassifier.js
// Decides whether a query needs Google Search grounding, or can be
// answered directly — saving latency/cost on the many queries that
// don't need real-time info.

const STATIC_PATTERNS = [
  /\b(what is|define|explain|how does|how do)\b/i,
  /\b(write|generate|create|compose)\b.*\b(poem|code|function|essay|story)\b/i,
  /\b(translate|summarize|rewrite|paraphrase)\b/i,
  /\bmath\b|\bcalculate\b|\d+\s*[\+\-\*\/]\s*\d+/i,
];

const DYNAMIC_PATTERNS = [
  /\b(today|yesterday|this week|latest|current|now|recent)\b/i,
  /\b(news|price|stock|score|weather|who won)\b/i,
  /\b(20\d{2})\b/,
  /\bwho is\b.*\b(ceo|president|prime minister|current)\b/i,
];

function heuristicClassify(query) {
  const isStatic = STATIC_PATTERNS.some((re) => re.test(query));
  const isDynamic = DYNAMIC_PATTERNS.some((re) => re.test(query));

  if (isDynamic && !isStatic) return "search";
  if (isStatic && !isDynamic) return "direct";
  return "ambiguous";
}

// Cheap Gemini call, only for ambiguous cases. `ai` is your existing
// GoogleGenAI client instance from script_backend.js.
async function llmClassify(ai, query) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify if this query requires real-time/current web information to answer accurately, or if it can be answered from general knowledge alone. Reply with exactly one word: "search" or "direct".\n\nQuery: "${query}"`,
      config: { maxOutputTokens: 5, temperature: 0 },
    });
    const text = response.text?.trim().toLowerCase() || "";
    return text.includes("search") ? "search" : "direct";
  } catch (err) {
    console.error("queryClassifier: LLM fallback failed, defaulting to search", err.message);
    return "search"; // fail open toward search — safer than a stale answer
  }
}

async function classifyQuery(ai, query) {
  const heuristicResult = heuristicClassify(query);
  if (heuristicResult !== "ambiguous") {
    return { useSearch: heuristicResult === "search", method: "heuristic" };
  }
  const llmResult = await llmClassify(ai, query);
  return { useSearch: llmResult === "search", method: "llm" };
}

module.exports = { classifyQuery };
