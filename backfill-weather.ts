import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement du fichier .env
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_API_KEY;
const weatherApiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !weatherApiKey) {
    throw new Error('Les variables d\'environnement ne sont pas toutes définies dans le .env');
}

// Initialiser le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Copie des types et fonctions nécessaires pour rendre le script autonome
type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';

const getWindStrengthCategory = (windSpeedKmh: number): WindStrength => {
    if (windSpeedKmh < 5) return 'calm';
    if (windSpeedKmh < 20) return 'light';
    if (windSpeedKmh < 40) return 'moderate';
    return 'strong';
};

// Fonction principale du script
async function backfillWeatherData() {
    console.log('Démarrage du script de remplissage des données météo...');

    // 1. Récupérer toutes les sessions où les données météo sont manquantes
    const { data: sessions, error: fetchError } = await supabase
        .from('fishing_sessions')
        .select('id, location_lat, location_lng, started_at')
        .is('weather_temp', null)
        .not('location_lat', 'is', null);

    if (fetchError) {
        console.error('Erreur lors de la récupération des sessions:', fetchError.message);
        return;
    }

    if (!sessions || sessions.length === 0) {
        console.log('Aucune session à mettre à jour. Tout est déjà à jour !');
        return;
    }

    console.log(`${sessions.length} session(s) trouvée(s) à mettre à jour.`);

    // 2. Boucler sur chaque session pour récupérer et mettre à jour les données
    for (const session of sessions) {
        console.log(`\nTraitement de la session ID: ${session.id}`);

        // Formater la date pour l'API (YYYY-MM-DD)
        const date = new Date(session.started_at).toISOString().split('T')[0];
        const query = `${session.location_lat},${session.location_lng}`;

        // L'API History de WeatherAPI est un plan payant. 
        // On utilise donc l'API Forecast qui donne les conditions du jour J.
        const url = `http://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${query}&dt=${date}&lang=fr`;

        try {
            const weatherResponse = await fetch(url);
            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                // Si la date est trop ancienne pour le plan gratuit, on passe à la suivante
                if (errorData.error.code === 1006) {
                     console.warn(`Avertissement: Impossible de récupérer la météo pour la date ${date} (plan API limité). Session ignorée.`);
                     continue;
                }
                throw new Error(errorData.error.message);
            }

            const weatherData = await weatherResponse.json();
            const dayForecast = weatherData.forecast.forecastday[0].day;

            const updates = {
                weather_temp: dayForecast.avgtemp_c,
                weather_conditions: dayForecast.condition.text,
                wind_speed_kmh: dayForecast.maxwind_kph,
                wind_strength: getWindStrengthCategory(dayForecast.maxwind_kph),
            };

            // 3. Mettre à jour la session dans Supabase
            const { error: updateError } = await supabase
                .from('fishing_sessions')
                .update(updates)
                .eq('id', session.id);

            if (updateError) {
                console.error(`Erreur de mise à jour pour la session ${session.id}:`, updateError.message);
            } else {
                console.log(`✅ Succès: Session ${session.id} mise à jour avec T: ${updates.weather_temp}°C, Cond: ${updates.weather_conditions}`);
            }

        } catch (e: any) {
            console.error(`Erreur lors du traitement de la session ${session.id}:`, e.message);
        }
        
        // Petite pause pour ne pas surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\nScript terminé !');
}

// Lancer le script
backfillWeatherData();
