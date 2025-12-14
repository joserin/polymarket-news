import type { APIContext } from 'astro';
import type { PolymarketEvent, CleanPrediction } from '../../env';

//const BASE_URL = 'https://gamma-api.polymarket.com';
const POLYMARKET_URL = 'https://gamma-api.polymarket.com/markets?order=volume24hr&ascending=false&closed=false&limit=10';

// --- LÓGICA DE LIMPIEZA DE DATOS (Adaptada de polymarketService.ts) ---
const cleanPolymarketData = (data: PolymarketEvent[]): CleanPrediction[] => {
    return data.map((event) => {
        const market = event as any;
        let outcomes: { label: string; price: number }[] = [];

        const rawOutcomes = market.outcomes;
        const rawPrices = market.outcomePrices;
        const image = market.image;
        const volume24hr = market.events[0].volume24hr;

        if (rawOutcomes && rawPrices) {
            try {
                const labels = JSON.parse(market.outcomes);
                const prices = JSON.parse(market.outcomePrices);
                outcomes = labels.map((label: string, index: number) => ({
                    label,
                    price: parseFloat(prices[index] || '0')
                }));
            } catch (e) {
                outcomes = [{ label: 'Yes', price: 0.5 }, { label: 'No', price: 0.5 }];
            }
        }

        return {
            id: event.id,
            question: event.question,
            image: image || 'https://picsum.photos/800/600',
            volume: volume24hr || event.volume,
            description: market.description,
            outcomes,
            startDate: event.startDate,
            endDate: event.endDate
        };
    }).filter(item => item.outcomes.length > 0);
};

export async function GET(context: APIContext) {
  try {
    const url = context.url;
    const offset = url.searchParams.get('offset') || '0';

    const POLYMARKET_URLOffset = `${POLYMARKET_URL}&offset=${offset}`;

    console.log("Servidor: Llamando a la API externa de Polymarket...");
    const response = await fetch(POLYMARKET_URLOffset);

    if (!response.ok) {
        throw new Error(`Polymarket API responded with status: ${response.status}`);
    }

    const data: PolymarketEvent[] = await response.json();
    const cleanedData = cleanPolymarketData(data);
    
    // Retorna la respuesta como JSON
    return new Response(JSON.stringify({ featured: cleanedData }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Error durante la llamada al servidor de Polymarket:", error);
  }
}
