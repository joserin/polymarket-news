import type { APIRoute } from 'astro';
import { GoogleGenAI } from "@google/genai";
import { promises as fs } from 'fs';
import path from 'path';

const API_KEY = import.meta.env.GEMINI_API_KEY
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: API_KEY});
const CACHE_DIR = path.join(process.cwd(), 'generated_comments');

export const POST: APIRoute = async ({ request }) => {

  let text: string;
  let marketQuestion: string;
  let id: string;

  try {
    const body = await request.json();
      text = body.text;
      marketQuestion = body.marketQuestion;
      id = body.id;
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON format in request body." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (!text || !marketQuestion || !id) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: 'text', 'marketQuestion', and 'id'." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const filename = `${id}.txt`;
  const filePath = path.join(CACHE_DIR, filename);

  // --- LÓGICA DE CACHE / PERSISTENCIA ---

  try {
    const cachedComment = await fs.readFile(filePath, 'utf-8');
    return new Response(JSON.stringify({ comment: cachedComment }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (e) {
        console.error("Error al crear el directorio de caché:", e);
    }

    const prompt = `
      Act as a degenerate, cynical, and darkly humorous financial commentator.
      You are viewing a bet on Polymarket called: "${marketQuestion}".
      Context description: "${text}".
      
      Generate a short commentary (maximum 30 seconds) about this.
      Mock the bettors, the risk, or the global situation.
      Reply ONLY with your comment.
      Make it funny but biting. Speak in English.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const generatedText = response.text;

      if(!generatedText) {
        return new Response(JSON.stringify({ error: "AI did not return any content." }), { status: 500, headers: { "Content-Type": "application/json" } });
      }

      await fs.writeFile(filePath, generatedText);
      console.log(`[GUARDADO] Comentario guardado en: ${filePath}`);
      
      return new Response(JSON.stringify({ comment: generatedText }), { status: 200, headers: { "Content-Type": "application/json" } });
      
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "An error occurred while processing the request." }), { status: 500, headers: { "Content-Type": "application/json" } });
    
    }
  }
  
};