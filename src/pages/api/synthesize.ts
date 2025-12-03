import type { APIRoute } from 'astro';
import { Client } from "@gradio/client";
import { promises as fs } from 'fs';
import path from 'path';

const HF_SPACE_URL = "NihalGazi/Text-To-Speech-Unlimited";
let client: Client | null = null;
const AUDIO_CACHE_DIR = path.join(process.cwd(), 'audio_cache');

type GradioAudioOutput = [
    {
        path: string; // Nuevo campo visto en el log
        url: string;  // El campo que contiene la URL web real
        size: number | null;
        orig_name: string;
        mime_type: string | null;
        is_stream: boolean;
        meta: Record<string, any>;
    },
    string
];

// Función de inicialización para asegurar la conexión
const getClient = async () => {
    if (!client) {
        client = await Client.connect(HF_SPACE_URL);
    }
    return client;
};

export const POST: APIRoute = async ({ request }) => {

    let text: string;
    let id: string;

    try {
        const body = await request.json();
        text = body.text;
        id = body.id;
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON format in request body." }), { status: 400 });
    }

    if (!text || !id) {
        return new Response(
        JSON.stringify({ error: "Missing required fields: 'text' and 'id'." }),
        { status: 400 }
        );
    }

    const filename = `${id}.mp3`;
    const filePath = path.join(AUDIO_CACHE_DIR, filename);

    // --- LÓGICA DE CACHE: 1. COMPROBAR EXISTENCIA ---
    try {
        await fs.access(filePath);
        const cachedAudio = await fs.readFile(filePath);
        console.log(`[AUDIO CACHE HIT] Devolviendo audio cacheado para ID: ${id}`);

        return new Response(JSON.stringify({ 
            audioUrl: cachedAudio.toString('base64'),
        }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (e) {
        // Si hay un error (ej: ENOENT - Archivo no encontrado), continuar con la generación.
        console.log(`[AUDIO CACHE MISS] Generando nuevo audio para ID: ${id}`);
    }

    // --- Lógica de Llamada a Hugging Face ---
    try {
        await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });
        const hfClient = await getClient();
        // Llama al endpoint de Text-to-Speech
        const texto = 'Will Nasry Juan Asfura Zablah win the 2025 Honduras presidential election?'
        const result = await hfClient.predict("/text_to_speech_app", {
            prompt: texto,
            voice: "shimmer",
            emotion: "sarcastic and mocking", // Usamos una emoción por defecto simple
            use_random_seed: true,
            // specific_seed: 12345, // No es necesario si use_random_seed es true
        });

        if(!result || !result.data) {
            throw new Error("No result returned from Hugging Face API.");
        }
        
        const dataArray = result.data as GradioAudioOutput;
        const audioData = dataArray[0];
        const statusMessage = dataArray[1];
        // El campo 'name' o 'data' de Gradio suele ser la URL temporal al archivo de audio
        const audioUrl = audioData.url;
        
        if (!audioUrl) {
            throw new Error("Hugging Face API did not return a valid audio URL.");
        }

        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error(`Failed to download audio from Hugging Face URL: ${audioResponse.statusText}`);
        }
        
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        
        // 3. GUARDAR el audio localmente
        await fs.writeFile(filePath, audioBuffer);
        console.log(`[GUARDADO] Audio MP3 guardado en: ${filePath}`);

        return new Response(JSON.stringify({ 
            audioUrl: audioBuffer.toString('base64'),
        }), { status: 200, headers: { "Content-Type": "application/json" } });
        
    } catch (error) {
        console.error("Error al llamar a Hugging Face API:", error);
        return new Response(JSON.stringify({ 
            error: "An error occurred while synthesizing audio.",
            details: error instanceof Error ? error.message : "Unknown error"
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};