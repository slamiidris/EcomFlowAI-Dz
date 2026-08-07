import { GoogleGenAI, Type } from "@google/genai";
import { callGeminiWithRetry } from "./gemini";

export interface ScoutedProduct {
  name: string;
  category: string;
  description: string;
  trendingScore: number;
  estimatedPrice: string;
  sourceChannel: string;
  whyTrending: string;
  marketingHook: string;
  imageKeywords: string;
}

export async function scoutTelegramProducts(query: string = "") {
  let trendContext = "";
  try {
    const trendRes = await fetch('/api/telegram-trends');
    if (trendRes.ok) {
      const trendData = await trendRes.json();
      trendContext = `CONGRÈS RÉEL (TELEGRAM DZ) : Canaux surveillés: ${trendData.channels.join(', ')}. Pulse: ${trendData.lastPulse}.`;
    }
  } catch (e) {
    console.warn("Could not fetch real trend context, falling back to pure simulation.");
  }

  const hasTelegramKeys = !!((import.meta as any).env.VITE_TELEGRAM_BOT_TOKEN || (import.meta as any).env.VITE_TELEGRAM_API_ID);

  const systemInstruction = `
    # ROLE
    Tu es un Expert Product Scout spécialisé dans le marché e-commerce algérien.
    TU ANALYSES LES TENDANCES RÉELLES SUR LES CANAUX TELEGRAM ALGERIA.
    
    # CONTEXTE RÉEL
    ${trendContext || "Analyse basée sur les historiques de tendances (Simulation)."}
    ${hasTelegramKeys ? "ACCÈS API BOT/MTPROTO : Actif sur les canaux DZ identifiés." : "MODE PUBLIC : Analyse des flux publics et saisonnalité."}
    
    # MISSION
    Retourne les 6 meilleurs produits détectés dans les messages récents pour la niche : "${query || 'Toutes niches'}".
    Sois très précis sur les prix en DZD et les accroches en Darija.
  `;

  return callGeminiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: query ? `Recherche pour la niche: ${query}` : "Top tendances e-commerce Algérie COD",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["products"],
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "category", "description", "trendingScore", "estimatedPrice", "sourceChannel", "whyTrending", "marketingHook", "imageKeywords"],
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  trendingScore: { type: Type.NUMBER },
                  estimatedPrice: { type: Type.STRING },
                  sourceChannel: { type: Type.STRING },
                  whyTrending: { type: Type.STRING },
                  marketingHook: { type: Type.STRING },
                  imageKeywords: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return (data.products || []) as ScoutedProduct[];
  }).catch(error => {
    console.error("Scouting failed after retries:", error);
    throw error; // Let the caller handle the UI state for persistent failure
  });
}
