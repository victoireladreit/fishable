// lib/formatters.ts

/**
 * Formats a total number of seconds into a HH:MM:SS string.
 * @param totalSeconds - The total seconds to format.
 * @returns A string in HH:MM:SS format.
 */
export const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [hours, minutes, seconds]
        .map((v) => String(v).padStart(2, '0'))
        .join(':');
};

/**
 * Formats a total number of minutes into a more readable duration string.
 * e.g., 75 minutes becomes "1h 15min".
 * @param totalMinutes - The total minutes to format.
 * @returns A formatted duration string or null if the input is invalid.
 */
export const formatDuration = (totalMinutes: number | null) => {
    if (totalMinutes === null || totalMinutes < 0) return null;
    if (totalMinutes < 60) {
        return `${totalMinutes}min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`.trim();
};
