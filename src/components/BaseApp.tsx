import React, { useEffect, useState, useRef } from 'react';
import { fetchPredictions } from '../sevices/polymarketService';
import type { CleanPrediction } from '../env.d';
import MainDisplay from '../components/MainDisplay';
import Sidebar from '../components/Sidebar';

const DATA_REFRESH_INTERVAL = 12 * 60 * 1000; // 12 minutes
const ROTATION_INTERVAL = 60; // 1 minute

const BaseApp = () => {

    const [trending, setTrending] = useState<CleanPrediction[]>([]);
    const [featured, setFeatured] = useState<CleanPrediction[]>([]);
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
    const [timeUntilNext, setTimeUntilNext] = useState(ROTATION_INTERVAL);
    const offsetRef = useRef(0);

    // Initialize fetching
    useEffect(() => {
        const loadData = async () => {

            const currentOffset = offsetRef.current;
            console.log('Fetching Polymarket data...');
            const { trending, featured } = await fetchPredictions(currentOffset);
            setTrending(trending);
            setFeatured(featured);
            // Reset index if it goes out of bounds after new fetch
            setCurrentFeaturedIndex(prev => (prev >= featured.length ? 0 : prev));

            // Después de la carga exitosa, calcula y actualiza el valor para la próxima llamada
            offsetRef.current = currentOffset + 20;
        };
    
        loadData();
    
        // Refresh data every 10 minutes
        const dataInterval = setInterval(loadData, DATA_REFRESH_INTERVAL);
    
        return () => clearInterval(dataInterval);
    }, []);

    // Handle Rotation of Featured Content
    useEffect(() => {
        // Reset timer when index changes
        setTimeUntilNext(ROTATION_INTERVAL);

        const timerInterval = setInterval(() => {
            setTimeUntilNext((prev) => {
                if (prev <= 1) {
                    // Time to switch
                    setCurrentFeaturedIndex((current) => 
                    featured.length > 0 ? (current + 1) % featured.length : 0
                    );
                    return ROTATION_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [featured.length]); // Re-run if featured list changes length dramatically, though usually stable

    return (
        <div className="flex overflow-hidden flex-row">
			<main className="flex">
				<MainDisplay
                    prediction={featured[currentFeaturedIndex] || null} 
                    timeUntilNext={timeUntilNext}
                />
			</main>
			<aside className=" w-[35%] border-b md:border-b-0 md:border-l border-slate-800">
				<Sidebar predictions={trending}/>
			</aside>
		</div>
    )

};

export default BaseApp;

