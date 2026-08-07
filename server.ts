import express from "express";
import path from "path";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for images

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// List of real-ish Algerian e-commerce channels to monitor
const DZ_CHANNELS = [
  "import_algerie",
  "grossiste_dz_shop",
  "algiers_marketplace",
  "vente_gros_dz",
  "shopping_dz_store"
];

// API routes setup within startServer to keep it clean
async function startServer() {
  try {
    // 1. API routes first
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", env: process.env.NODE_ENV });
    });

    app.post("/api/ai/generate-product", async (req, res) => {
      try {
        const { image, currentName, purchasePrice, sellingPrice } = req.body;
        
        let prompt = "Tu es un expert en e-commerce pour le marché algérien. ";
        prompt += "Génère un nom de produit accrocheur EN FRANÇAIS et une description convaincante (mettant en avant les points forts) EN ARABE (Daridja algérienne ou Arabe standard). ";
        prompt += "Choisis la catégorie la plus appropriée parmi: Electronique, Maison, Beauté, Mode, Cuisine, Fitness. ";
        
        if (purchasePrice && sellingPrice) {
          prompt += `\nEn tenant compte d'un prix d'achat de ${purchasePrice} DZD et d'un prix de vente de ${sellingPrice} DZD, suggère un CPA cible (le coût par acquisition maximum acceptable pour rester rentable) en Euros (€). Prends en compte les frais de livraison (env. 600-800 DZD) et le taux de confirmation/livraison moyen en Algérie (40-60%).`;
        } else {
          prompt += "\nSuggère également un CPA cible réaliste en Euros (€) pour ce type de produit sur le marché algérien.";
        }

        prompt += "\nRéponds uniquement en JSON avec les champs: name, description, category, targetCPA (nombre ou chaîne représentant le montant en €).";
        
        if (currentName) {
          prompt += `\nNom actuel du produit: ${currentName}`;
        }

        const contents: any[] = [{ text: prompt }];

        if (image && image.includes('base64,')) {
          const base64Data = image.split('base64,')[1];
          const mimeType = image.split(';')[0].split(':')[1];
          contents.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: { parts: contents },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                targetCPA: { type: Type.STRING }
              },
              required: ["name", "description", "category", "targetCPA"]
            }
          }
        });

        const result = JSON.parse(response.text || '{}');
        res.json(result);
      } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate product info" });
      }
    });

    // Mock endpoint that would theoretically use MTProto/Bot API
    app.get("/api/telegram-trends", async (req, res) => {
      res.json({
        channels: DZ_CHANNELS,
        status: "connected",
        lastPulse: new Date().toISOString(),
        rawSnippet: "Simulation of raw telegram messages from Algerie channels..."
      });
    });

    // 2. Vite middleware (development only)
    // We explicitly check for production to avoid starting Vite in the deployed container
    const isProduction = process.env.NODE_ENV === "production";
    
    if (!isProduction) {
      console.log("Starting in development mode with Vite middleware...");
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (err) {
        console.error("Failed to start Vite dev server, falling back to static:", err);
      }
    }
    
    // In production (or fallback), serve static files
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`Checking for static directory at: ${distPath}`);
    
    app.use(express.static(distPath));
    
    // Catch-all route for SPA - handles all other GET requests
    // In Express 5, use *all to catch everything
    app.get('*all', (req, res, next) => {
      // Skip if it's an API route that wasn't matched
      if (req.url.startsWith('/api/')) return next();
      
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          // If index.html is missing, return a basic error instead of crashing
          console.error(`Error sending index.html from ${indexPath}:`, err);
          res.status(500).send("Application root (index.html) not found. Please ensure the build completed successfully.");
        }
      });
    });

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on 0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);
    });

    server.on('error', (err) => {
      console.error("Server listener error:", err);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
