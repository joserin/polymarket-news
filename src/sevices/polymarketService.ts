import type { CleanPrediction } from '../env';

export const fetchPredictions = async (offset: number): Promise<{ featured: CleanPrediction[] }> => {

    const LOCAL_API_URL = `/api/polymarket?offset=${offset}`;

    try {
        // Attempt to fetch from Polymarket Gamma API
        const response = await fetch(LOCAL_API_URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return {
            featured: data.featured || []
        };
    } catch (error) {
        console.warn("Failed to fetch from Polymarket API (likely CORS), using mock data.", error);
        // Si la llamada al endpoint de Astro falla completamente (p. ej., servidor de Astro caído)
        return {
            featured: []
        };
    }
};
