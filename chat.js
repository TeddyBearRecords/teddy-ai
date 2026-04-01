const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM = `Tu es TEDDY — une intelligence artificielle d'élite.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // 1. Vérification de la clé
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("LA CLÉ GEMINI_API_KEY EST MANQUANTE DANS NETLIFY");
    }

    const { messages } = JSON.parse(event.body);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: SYSTEM 
    });

    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContent({ contents: geminiMessages });
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.text() }),
    };
  } catch (err) {
    // CETTE LIGNE EST LA PLUS IMPORTANTE : elle va écrire l'erreur dans tes logs Netlify
    console.error("ERREUR TEDDY :", err.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
