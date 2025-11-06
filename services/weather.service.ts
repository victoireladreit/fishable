const API_URL = 'http://api.weatherapi.com/v1/current.json';
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

interface WeatherApiResponse {
    current: {
        temp_c: number;
        condition: {
            text: string;
        };
        wind_kph: number;
        wind_dir: string;
        pressure_mb: number;
    };
}

export const WeatherService = {
    async getWeatherByCoords(latitude: number, longitude: number) {
        if (!WEATHER_API_KEY) {
            console.error("Clé API météo non définie.");
            return null;
        }

        const url = `${API_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&lang=fr`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur API météo:", errorData.error.message);
                return null;
            }
            const data: WeatherApiResponse = await response.json();
            return {
                temperature: data.current.temp_c,
                conditions: data.current.condition.text,
                windSpeed: data.current.wind_kph,
                windDirection: data.current.wind_dir,
                pressure: data.current.pressure_mb,
            };
        } catch (error) {
            console.error("Erreur dans WeatherService:", error);
            return null;
        }
    }
};
