export interface PolymarketOutcome {
  price: number;
  label: string;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  outcomes: string; // JSON string in raw API
  outcomePrices: string; // JSON string in raw API
  volume: number;
  closed: boolean;
  bestAsk?: number;
}

export interface PolymarketEvent {
  id: string;
  question: string;
  slug: string;
  image: string;
  icon: string;
  description: string;
  //markets: PolymarketMarket[];
  volume: number;
  startDate: string;
  endDate: string;
}

// Cleaned up internal type for easier UI consumption
export interface CleanPrediction {
  id: string;
  question: string;
  image: string;
  volume: number;
  outcomes: { label: string; price: number }[];
  description: string;
  startDate: string;
  endDate: string;
}