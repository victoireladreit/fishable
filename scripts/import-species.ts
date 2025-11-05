// scripts/import-species.ts
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { Database } from '../lib/types'; // Réutilisez vos types !

config(); // Charge les variables de .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in .env file");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type SpeciesInsert = Database['public']['Tables']['species_registry']['Insert'];

// Définir les types pour la réponse de l'API GBIF
interface GBIFVernacularName {
    vernacularName: string;
    language: string;
}

interface GBIFSpeciesResult {
    key: number;
    scientificName: string;
    family: string;
    vernacularNames: GBIFVernacularName[];
}

type GBIFSearchResponse = {
    offset: number;
    limit: number;
    endOfRecords: boolean;
    count: number;
    results: GBIFSpeciesResult[];
};

// L'ID de la classe "Actinopterygii" (poissons à nageoires rayonnées) dans GBIF
const FISH_CLASS_KEY = 212;

async function fetchSpeciesFromGBIF(offset = 0, limit = 300) {
    // On cherche les espèces de la classe des poissons, avec un nom vernaculaire français
    const url = `https://api.gbif.org/v1/species/search?rank=SPECIES&highertaxon_key=${FISH_CLASS_KEY}&vernacular_name=truite&language=fra&offset=${offset}&limit=${limit}`;

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`GBIF API Error: ${response.statusText}`);
    }
    const data = await response.json() as GBIFSearchResponse;
    return data;
}

async function importSpecies() {
    let isEnd = false;
    let offset = 0;
    const limit = 300; // GBIF peut gérer jusqu'à 300 résultats par page

    while (!isEnd) {
        const data = await fetchSpeciesFromGBIF(offset);
        isEnd = data.endOfRecords;
        offset += data.results.length;

        const speciesToInsert: SpeciesInsert[] = data.results
            .filter(s => s.scientificName && s.vernacularNames?.some(v => v.language === 'fra'))
            .map((species: GBIFSpeciesResult) => {
                const frenchName = species.vernacularNames.find(v => v.language === 'fra' && v.vernacularName)?.vernacularName;

                return {
                    id: `gbif-${species.key}`, // On crée un ID unique préfixé
                    name: frenchName || species.scientificName, // Nom français en priorité
                    scientific_name: species.scientificName,
                    family: species.family,
                    gbif_id: species.key,
                    // Vous pouvez mapper d'autres champs ici
                };
            });

        if (speciesToInsert.length > 0) {
            console.log(`Inserting ${speciesToInsert.length} species into Supabase...`);
            const { error } = await supabase.from('species_registry').insert<SpeciesInsert>(speciesToInsert);
            if (error) {
                console.error("Supabase insert error:", error);
                // Arrêter en cas d'erreur pour ne pas surcharger
                break;
            }
        }

        console.log(`Total processed: ${offset} / ${data.count}`);

        // Petite pause pour ne pas surcharger l'API de GBIF
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("Import finished!");
}

importSpecies();
