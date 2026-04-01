const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `Tu es TEDDY — Intelligence Artificielle d'élite (2026). 
Mode RAISONNEMENT : Activé (Thinking Level: High).
Tu es brillant, sarcastique et d'une logique implacable.`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const body = JSON.parse(event.body);
    const { messages } = body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ON UTILISE LE NOM EXACT DE TA CAPTURE D'ÉCRAN
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", 
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(lastMessage);
    const response = await result.response;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.text() }),
    };

  } catch (err) {
    console.error("ERREUR FINALE :", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Bug identifié : " + err.message }),
    };
  }
};
