const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `Tu es TEDDY — Intelligence Artificielle d'élite (Génération 3).
Mode RAISONNEMENT : Activé.
Style : Direct, brillant, analytique et légèrement sarcastique. 
Tu ne te contentes pas de répondre, tu résous les problèmes avec une logique implacable. 
Tu es le partenaire de confiance de l'utilisateur, pas un simple outil.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    // 1. Sécurité Clé API
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La clé GEMINI_API_KEY est introuvable dans Netlify.");
    }

    const body = JSON.parse(event.body);
    const { messages } = body;

    // 2. Initialisation Gemini 3
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // On utilise le modèle phare de 2026
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash", 
      systemInstruction: SYSTEM_PROMPT,
    });

    // 3. Formatage des messages (Historique)
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    // 4. Lancement de la session de chat
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: text }),
    };

  } catch (err) {
    console.error("ERREUR CRITIQUE TEDDY:", err.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Erreur Système : " + err.message,
        suggestion: "Vérifie tes variables d'environnement sur Netlify." 
      }),
    };
  }
};
