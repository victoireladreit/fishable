type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';

export const getWindStrengthCategory = (windSpeedKmh: number): WindStrength => {
    if (windSpeedKmh < 5) {
        return 'calm';
    } else if (windSpeedKmh < 20) {
        return 'light';
    } else if (windSpeedKmh < 40) {
        return 'moderate';
    } else {
        return 'strong';
    }
};
