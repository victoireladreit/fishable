import { useEffect, useRef, useState, useCallback } from 'react';

export const useTimer = (initialSeconds = 0) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(() => {
        if (isRunning) return;
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
    }, [isRunning]);

    const pause = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const reset = () => {
        pause();
        setSeconds(0);
    };

    useEffect(() => {
        // Démarrer le timer automatiquement si des secondes initiales sont fournies
        if (initialSeconds > 0) {
            start();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [initialSeconds]);

    const formatTime = (timeInSeconds: number) => {
        const hrs = Math.floor(timeInSeconds / 3600);
        const mins = Math.floor((timeInSeconds % 3600) / 60);
        const secs = timeInSeconds % 60;
        return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
    };

    return { seconds, setSeconds, formatTime, isRunning, start, pause, reset };
};
