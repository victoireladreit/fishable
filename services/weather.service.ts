const API_URL_CURRENT = 'http://api.weatherapi.com/v1/current.json';
const API_URL_HISTORY = 'http://api.weatherapi.com/v1/history.json';
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

interface WeatherApiResponse {
    current?: {
        temp_c: number;
        condition: {
            text: string;
        };
        wind_kph: number;
        wind_dir: string;
        pressure_mb: number;
    };
    forecast?: {
        forecastday: {
            hour: {
                temp_c: number;
                condition: {
                    text: string;
                };
                wind_kph: number;
                wind_dir: string;
                pressure_mb: number;
            }[];
        }[];
    };
}

export const WeatherService = {
    async getWeatherByCoords(latitude: number, longitude: number, date?: Date) {
        if (!WEATHER_API_KEY) {
            console.error("Clé API météo non définie.");
            return null;
        }

        let url = '';
        let isHistory = false;

        if (date) {
            const dateString = date.toISOString().split('T')[0];
            url = `${API_URL_HISTORY}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&dt=${dateString}&lang=fr`;
            isHistory = true;
        } else {
            url = `${API_URL_CURRENT}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&lang=fr`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur API météo:", errorData.error.message);
                return null;
            }
            const data: WeatherApiResponse = await response.json();

            if (isHistory && data.forecast?.forecastday[0]) {
                // For history, we'll average the hourly data for a representative value
                const hourData = data.forecast.forecastday[0].hour;
                const avgTemp = hourData.reduce((acc, h) => acc + h.temp_c, 0) / hourData.length;
                const avgWind = hourData.reduce((acc, h) => acc + h.wind_kph, 0) / hourData.length;
                // Conditions can be taken from midday for simplicity
                const conditions = hourData[12]?.condition.text || hourData[0]?.condition.text;

                return {
                    temperature: avgTemp,
                    conditions: conditions,
                    windSpeed: avgWind,
                    windDirection: hourData[12]?.wind_dir || hourData[0]?.wind_dir,
                    pressure: hourData[12]?.pressure_mb || hourData[0]?.pressure_mb,
                };
            } else if (!isHistory && data.current) {
                return {
                    temperature: data.current.temp_c,
                    conditions: data.current.condition.text,
                    windSpeed: data.current.wind_kph,
                    windDirection: data.current.wind_dir,
                    pressure: data.current.pressure_mb,
                };
            }
            return null;
        } catch (error) {
            console.error("Erreur dans WeatherService:", error);
            return null;
        }
    }
};
