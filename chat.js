const { GoogleGenAI } = require("@google/genai"); // Nouvelle lib 2026

const SYSTEM_PROMPT = `Tu es TEDDY — Intelligence Artificielle d'élite. 
Mode RAISONNEMENT : Activé (High). 
Tu es le cerveau de 2026, brillant et analytique.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const { messages } = JSON.parse(event.body);
    
    // Initialisation avec la nouvelle classe 2026
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // On prépare les contenus en gardant TOUTES les données (y compris les signatures de pensée)
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Appel au modèle avec le paramètre de réflexion (thinking_level)
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        thinkingConfig: {
          thinkingLevel: "high" // C'est ici qu'on active ton mode RAISONNEMENT
        }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.text }),
    };

  } catch (err) {
    console.error("ERREUR GEMINI 3:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erreur 2026 : " + err.message }),
    };
  }
};
