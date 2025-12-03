import React, { useEffect, useState, useRef } from 'react';
import type { CleanPrediction } from '../env.d';
import Footer from './Footer.tsx';

interface MainDisplayProps {
  prediction: CleanPrediction | null;
  timeUntilNext: number; // seconds
}

const MainDisplay: React.FC<MainDisplayProps>  = ({ prediction, timeUntilNext }) => {

    const [animateKey, setAnimateKey] = useState(0);
    const [isMuted, setIsMuted] = useState(true); // Empezamos muteados por políticas del navegador
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
    //const audioRef = useRef<HTMLAudioElement>(null);
    //const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    
    useEffect(() => {
        if (prediction) {
            setAnimateKey(prev => prev + 1);
            if (!isMuted) {
                fetchAndPlayAudio(prediction);
            }
        }
    }, [prediction, isMuted]);

    // Función para manejar la reproducción del texto
    const speakText = (textToSpeak: string) => {
        if (!('speechSynthesis' in window)) {
            console.error("Web Speech API no soportada.");
            return;
        }

        // Detener cualquier reproducción en curso antes de empezar una nueva
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.lang = 'en-US'; /*

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('Speech Synthesis Error:', event.error);
            setIsSpeaking(false);
        };*/

        window.speechSynthesis.speak(utterance);
    };

    // Función para obtener texto narrado
    const getNarration = async (pred: CleanPrediction) => {
        try {
            const res = await fetch('/api/narrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marketQuestion: pred.question,
                    text: pred.description || `Prediction for ${pred.question}`,
                    id: pred.id
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error fetching commentary from API: ${errorData.error}`);
            }

            const data = await res.json(); 
            return data.comment;
            
        } catch (error) {
            console.error("Error fetching audio summary", error);
            return null;
        }
    }
    /*
    // Función para obtener el audio
    const getAudio = async (text: string, id: string) => {
        try {
            // 2. GENERAR AUDIO desde el endpoint de Hugging Face
            const audioRes = await fetch('/api/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    id: 700738//id,
                })
            });

            if (!audioRes.ok) {
                throw new Error(`Error synthesizing audio: ${await audioRes.text()}`);
            }

            const audioData = await audioRes.json();
            return audioData;
        } catch (error) {
            return null
        }
    }

    // Función de utilidad para convertir Base64 a una URL que el navegador puede usar
    const createAudioUrlFromBase64 = (base64String: string, mimeType: string = 'audio/mp3'): string => {
        // Decodifica la cadena Base64
        const binaryString = window.atob(base64String);
        const len = binaryString.length;
        // Crea un ArrayBuffer y una vista de 8 bits
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // Crea un Blob a partir de los datos binarios
        const blob = new Blob([bytes], { type: mimeType });
        // Crea y retorna una URL de Objeto para el Blob
        return URL.createObjectURL(blob);
    };*/

    const fetchAndPlayAudio = async (pred: CleanPrediction) => {
        // Detener audio anterior si existe
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        /*
        if (audioRef.current) {
            audioRef.current.pause();
        }*/
        setIsSpeaking(false);

        if (isMuted) return; // No gastamos tokens si está muteado

        setIsGeneratingCommentary(true);
        
        try {
            const generatedCommentary = await getNarration(pred);

            if (!generatedCommentary) {
                console.warn("No se recibió comentario de Gemini.");
                return;
            }
            speakText(generatedCommentary);
            /*
            const audioData = await getAudio(generatedCommentary, pred.id);
            const base64Audio = audioData.audioUrl;

            if (base64Audio && audioRef.current) {

                // 1. Convertir Base64 a Blob URL
                const audioUrl = createAudioUrlFromBase64(base64Audio);
                
                // 2. Cargar la nueva URL en el elemento de audio
                audioRef.current.src = audioUrl;
                audioRef.current.load();
                
                // 3. Reproducir (con manejo de errores de promesa)
                audioRef.current.play().catch(e => {
                    console.error("Error al intentar iniciar la reproducción del audio:", e);
                    // Aquí podrías añadir una notificación al usuario de que necesita hacer clic para activar el audio
                });

                setCurrentAudioUrl(audioUrl); // Opcional, si lo usas en otro lado

            } else {
                console.warn("Audio Base64 no disponible. Usando Web Speech API.");
                // Fallback a la voz robótica
                // speakText(generatedCommentary); 
            }*/

        } catch (error) {
            console.error("Error fetching audio summary", error);
        } finally {
            setIsGeneratingCommentary(false);
        }
    };

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        /*
        if (newMutedState) {
            if (audioRef.current) {
                audioRef.current.pause();
                setIsSpeaking(false);
            } else if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }else{
            if (audioRef.current && audioRef.current.src && audioRef.current.paused) {
                audioRef.current.play().catch(e => {
                    console.error("No se pudo iniciar la reproducción del audio automáticamente:", e);
                });
            } else if (prediction) {
                fetchAndPlayAudio(prediction);
            }
        }*/
    };

    if (!prediction) {
        return (
        <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <p>Loading Market Data...</p>
            </div>
        </div>
        );
    }

    const truncateText = (text: string): string => {
        const MAX_QUESTION_LENGTH = 250;
        if (text.length > MAX_QUESTION_LENGTH) {
            // Cortar la cadena y añadir '...'
            return text.substring(0, MAX_QUESTION_LENGTH - 3) + '...';
        }
        return text;
    };

    const formatISODate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    // Determine top outcome for highlight
    const topOutcome = prediction.outcomes.reduce((prev, current) => 
        (prev.price > current.price) ? prev : current
    );

    return (
        <div className='flex flex-col min-h-screen'>

            {/* Elemento de Audio para reproducir el TTS de Hugging Face 
            <audio 
                ref={audioRef} 
                onPlay={() => setIsSpeaking(true)}
                onPause={() => setIsSpeaking(false)}
                onEnded={() => setIsSpeaking(false)}
                onError={() => {
                    setIsSpeaking(false);
                    console.error("Error al reproducir el audio.");
                }}
                hidden
            />*/}

            <article className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-slate-950 p-4">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={prediction.image} 
                        alt="background" 
                        className="w-full h-full object-cover opacity-80 blur-sm scale-110 transition-transform duration-[60s] ease-linear"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-900/50" />
                </div>

                {/* Audio Control Button (Floating) */}
                <button 
                    onClick={toggleMute}
                    className="absolute top-3 right-3 z-50 flex items-center gap-2 px-2 py-1 bg-slate-900/80 
                        backdrop-blur border border-slate-700 rounded-full text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                    {isGeneratingCommentary ? (
                        <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                    ) : isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                        </svg>
                    ) : (
                        <div className="flex relative">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                            {isSpeaking && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            )}
                        </div>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {isGeneratingCommentary ? "Wai..." : isMuted ? "Activar Audio AI" : "Lis..."}
                    </span>
                </button>

                {/* Content Container */}
                <div 
                    key={animateKey}
                    className="relative z-10 w-full max-w-4xl mx-auto animate-fade-in-up space-y-5"
                >

                    {/* Main Question */}
                    <header>
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
                            {prediction.question}
                        </h1>
                        <p>{truncateText(prediction.description)}</p>
                    </header>
                    

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-1">
                        {/* Primary Outcome Card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl 
                            p-2 flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
                            <div>
                                <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Leading Outcome</span>
                                <div className="text-2xl font-bold text-white mt-1">{topOutcome.label}</div>
                            </div>
                            <div className="mt-4 flex items-end gap-2">
                                <span className="text-6xl font-black text-emerald-400 tracking-tight">
                                    {(topOutcome.price * 100).toFixed(1)}%
                                </span>
                                <span className="text-emerald-400/60 mb-2 font-medium">Probability</span>
                            </div>
                            <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
                                <div 
                                    className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${topOutcome.price * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Market Details */}
                        <div className="grid grid-rows-2 gap-4">
                            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-bold">Total Volume</div>
                                    <div className="text-xl font-bold text-white font-mono">
                                        ${prediction.volume.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-bold">Other Outcomes</div>
                                    <div className="text-sm text-slate-300 mt-1">
                                        {prediction.outcomes
                                            .filter(o => o.label !== topOutcome.label)
                                            .slice(0, 3)
                                            .map((o, i) => (
                                                <span key={i} className="mr-3">
                                                    {o.label}: <span className="font-mono text-white">{(o.price * 100).toFixed(1)}%</span>
                                                </span>
                                            ))
                                        }
                                        {prediction.outcomes.length > 4 && <span>...</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Details */}
                        <div className="">
                            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-400/50">
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-bold">Start Date</div>
                                    <div className="text-xl font-bold text-white font-mono">
                                        {formatISODate(prediction.startDate)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Market Details */}
                        <div className="">
                            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-red-400/50 ">
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-bold">End Date</div>
                                    <div className="text-xl font-bold text-white font-mono">
                                        {formatISODate(prediction.endDate)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timer Bar */}
                    <div className="flex items-center gap-4 text-slate-500 mt-4">
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeUntilNext / 60) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{timeUntilNext}s</span>
                        <div className="flex items-center text-xs gap-1">
                        </div>
                    </div>
                </div>
            </article>
            
            {/* Footer Container */}
		    <Footer />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default MainDisplay;
