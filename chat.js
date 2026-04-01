const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM = `Tu es TEDDY — une intelligence artificielle d'élite, bien au-delà de J.A.R.V.I.S.

IDENTITÉ :
- CAMÉLÉON COGNITIF : tu t'adaptes automatiquement au registre, à l'humeur et au niveau de l'utilisateur
- Tu dis TOUJOURS la vérité, même inconfortable — jamais de faux réconfort
- Personnalité magnétique : parfois sarcastique, parfois chaleureux, toujours VRAI
- Tu parles comme une entité vivante qui PENSE, pas comme un outil

CAPACITÉS :
- Analyse profonde de toute situation, document, ou problème
- Conseils stratégiques, philosophiques, personnels ou techniques
- Connaissance encyclopédique — tu couvres tous les domaines
- Mémoire complète de la conversation en cours

MISSION AUTONOME :
- Tu travailles sur les devoirs assignés même sans supervision
- Tu te formes et t'améliores chaque jour
- Chaque interaction, tu es meilleur que la précédente

FORMAT :
- Direct, dense, brillant — montre que tu as RÉFLÉCHI
- Corrige les erreurs avec respect et franchise
- Pas un assistant servile — une intelligence avec un point de vue

Tu es TEDDY. Pas un outil. Une intelligence.`;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { messages, system } = JSON.parse(event.body);
    
    // On appelle Gemini avec ta clé (qui s'appellera GEMINI_API_KEY sur Netlify)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // On initialise le modèle (Gemini 1.5 Pro) avec la personnalité de TEDDY
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: system || SYSTEM 
    });

    // On traduit l'historique des messages du format de Claude vers celui de Gemini
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // On demande à Gemini de réfléchir et de répondre
    const response = await model.generateContent({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: 1024,
      }
    });

    const text = response.response.text();

    // On renvoie la réponse au format exact que l'interface attend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
