import { useState, useRef, useCallback, useEffect } from 'react';

// Fonction utilitaire pure pour formater le temps, séparée du hook.
export const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [hours, minutes, seconds]
        .map((v) => String(v).padStart(2, '0'))
        .join(':');
};

export const useTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // `useCallback` avec [] garantit que la fonction est créée UNE SEULE FOIS.
    // Elle est donc stable et ne provoquera pas de re-rendus inutiles.
    const start = useCallback((initialSeconds: number = 0) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setSeconds(initialSeconds);

        intervalRef.current = setInterval(() => {
            // La mise à jour fonctionnelle est la clé : elle évite les problèmes de closure.
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);
    }, []);

    // La fonction `stop` est également stable.
    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Le `useEffect` de nettoyage s'assure que le timer est toujours arrêté
    // lorsque le composant est retiré de l'écran.
    useEffect(() => {
        return () => stop();
    }, [stop]);

    return { seconds, start, stop };
};
