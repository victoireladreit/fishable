import { useState, useRef, useCallback, useEffect } from 'react';

export { formatTime } from '../lib/formatters';

export const useTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback((initialSeconds: number = 0) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setSeconds(initialSeconds);

        intervalRef.current = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);
    }, []);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    return { seconds, start, stop };
};
