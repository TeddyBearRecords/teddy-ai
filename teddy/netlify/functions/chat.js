const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_SYSTEM = `Tu es TEDDY — une intelligence artificielle d'élite. Tu es direct, puissant, et tu dis toujours la vérité.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // 1. Vérification de la clé
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("CLÉ GEMINI_API_KEY MANQUANTE — Va dans Netlify > Site configuration > Environment variables");
    }

    // 2. Parsing du body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      throw new Error("Corps de la requête invalide (JSON malformé)");
    }

    const { messages, system } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Le champ 'messages' est manquant ou vide");
    }

    // 3. Init Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Essayer gemini-1.5-flash en priorité (plus rapide et dispo), sinon pro
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: system || DEFAULT_SYSTEM,
      });
    } catch {
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: system || DEFAULT_SYSTEM,
      });
    }

    // 4. Conversion des messages au format Gemini
    // Gemini exige que le 1er message soit "user" et qu'ils alternent
    const geminiMessages = messages
      .filter(msg => msg.role && msg.content)
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Sécurité : s'assurer que le premier message est "user"
    if (geminiMessages.length === 0 || geminiMessages[0].role !== "user") {
      throw new Error("Le premier message doit être de rôle 'user'");
    }

    // 5. Appel API
    const result = await model.generateContent({ contents: geminiMessages });
    const response = result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: text }),
    };

  } catch (err) {
    console.error("ERREUR TEDDY:", err.message);

    // Messages d'erreur lisibles pour l'utilisateur
    let userMessage = err.message;
    if (err.message.includes("API_KEY_INVALID") || err.message.includes("400")) {
      userMessage = "Clé API Google invalide. Vérifie GEMINI_API_KEY dans Netlify.";
    } else if (err.message.includes("quota") || err.message.includes("429")) {
      userMessage = "Quota API dépassé. Attends quelques minutes ou vérifie ton plan Google AI Studio.";
    } else if (err.message.includes("SAFETY")) {
      userMessage = "Message bloqué par les filtres de sécurité Google.";
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: userMessage }),
    };
  }
};
