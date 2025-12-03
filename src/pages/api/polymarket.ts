import type { APIContext } from 'astro';
import type { PolymarketEvent, CleanPrediction } from '../../env';

//const BASE_URL = 'https://gamma-api.polymarket.com';
const POLYMARKET_URL = 'https://gamma-api.polymarket.com/markets?order=volume24hr&ascending=false&closed=false&limit=20';

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

    // Lógica de separación de datos (trending/featured)
    const combined = [...cleanedData];
    
    const trending = combined.slice(0, 8);
    const featured = combined.slice(8).length > 0 ? combined.slice(8) : combined.slice(0, 8);
    
    // Retorna la respuesta como JSON
    return new Response(JSON.stringify({ trending, featured }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Error durante la llamada al servidor de Polymarket:", error);
    /*
    // Fallback a mock data si el servidor falla
    const trendingMock = MOCK_EVENTS.slice(0, 5);
    const featuredMock = MOCK_EVENTS.slice(5, 12);
    
    // Es mejor retornar 200 (OK) para evitar que el fetch del frontend lance una excepción
    return new Response(JSON.stringify({ 
        trending: trendingMock, 
        featured: featuredMock, 
        warning: "Server-side fetch failed, using mock data." 
    }), {
        status: 200, 
        headers: { "Content-Type": "application/json" }
    });*/
  }
}
