import { agents, selectAgent } from "../agents/prompts.js";

export async function runAgent({ intent = "tutor", messages, context = "" }) {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  if (!provider || !apiKey) {
    const error = new Error("AI is not configured. Set AI_PROVIDER and AI_API_KEY in backend/.env.");
    error.status = 503;
    throw error;
  }
  const agentName = selectAgent(intent);
  const system = `${agents.orchestrator}\n\nSpecialist instructions:\n${agents[agentName]}\n\nTrusted course context:\n${context.slice(0, 12000)}`;
  let endpoint;
  let payload;
  let extract;
  if (provider === "openai") {
    endpoint = "https://api.openai.com/v1/chat/completions";
    payload = {
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.4,
    };
    extract = (data) => data.choices?.[0]?.message?.content;
  } else if (provider === "gemini") {
    const model = process.env.AI_MODEL || "gemini-2.5-flash";
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    payload = {
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(({ role, content }) => ({ role: role === "assistant" ? "model" : "user", parts: [{ text: content }] })),
      generationConfig: { temperature: 0.4 },
    };
    extract = (data) => data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  } else {
    const error = new Error("AI_PROVIDER must be either openai or gemini.");
    error.status = 500;
    throw error;
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: provider === "openai"
      ? { "content-type": "application/json", authorization: `Bearer ${apiKey}` }
      : { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const error = new Error(`AI provider request failed (${response.status}).`);
    error.status = 502;
    throw error;
  }
  const data = await response.json();
  const content = extract(data);
  if (!content) {
    const error = new Error("AI provider returned no response content.");
    error.status = 502;
    throw error;
  }
  return { content, agent: agentName };
}
