import { supabase } from '../config/supabase';
import { Database } from '../lib/types';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface ProfileStats {
    totalCaught: number;
    uniqueSpeciesCount: number;
    biggestWeightKg: number | null;
    biggestSizeCm: number | null;
    releaseRate: number | null; // Percentage
    mostCaughtSpecies: string | null; // New stat: most caught species
    favoriteTechnique: string | null;
    totalSessions: number;
}

const TABLE = 'profiles';
const BUCKET = 'fishable-avatars';

export const ProfileService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateProfile(userId: string, updates: ProfileUpdate) {
        // If username is being updated, also update it in the auth user metadata
        if (updates.username) {
            const { error: userError } = await supabase.auth.updateUser({
                data: { username: updates.username }
            });

            if (userError) {
                // Don't proceed with profile table update if auth update fails
                throw userError;
            }
        }

        const { data, error } = await supabase
            .from(TABLE)
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async checkUsernameAvailability(username: string): Promise<boolean> {
        const { count, error } = await supabase
            .from(TABLE)
            .select('id', { count: 'exact' })
            .eq('username', username);

        if (error) {
            console.error("Erreur lors de la vérification du nom d'utilisateur:", error);
            throw error;
        }
        return count === 0;
    },

    async getProfileStats(userId: string): Promise<ProfileStats> {
        // 1. Get user_pokedex entries
        const { data: pokedexEntries, error: pokedexError } = await supabase
            .from('user_pokedex')
            .select('species_id, total_caught, total_released, biggest_size_cm, biggest_weight_kg, techniques_used')
            .eq('user_id', userId);

        if (pokedexError) {
            console.error("Error fetching user pokedex:", pokedexError);
            throw pokedexError;
        }

        let totalCaught = 0;
        let totalReleased = 0;
        let biggestSizeCm: number | null = null;
        let biggestWeightKg: number | null = null;
        const uniqueSpecies = new Set<string>();
        const techniqueCounts: { [key: string]: number } = {};
        const speciesCaughtCounts: { [speciesId: string]: number } = {}; // To count total_caught per species

        if (pokedexEntries) {
            pokedexEntries.forEach(entry => {
                if (entry.total_caught) {
                    totalCaught += entry.total_caught;
                    if (entry.species_id) {
                        speciesCaughtCounts[entry.species_id] = (speciesCaughtCounts[entry.species_id] || 0) + entry.total_caught;
                    }
                }
                if (entry.total_released) totalReleased += entry.total_released;
                if (entry.species_id) uniqueSpecies.add(entry.species_id);

                if (entry.biggest_size_cm && (biggestSizeCm === null || entry.biggest_size_cm > biggestSizeCm)) {
                    biggestSizeCm = entry.biggest_size_cm;
                }
                if (entry.biggest_weight_kg && (biggestWeightKg === null || entry.biggest_weight_kg > biggestWeightKg)) {
                    biggestWeightKg = entry.biggest_weight_kg;
                }

                if (entry.techniques_used && Array.isArray(entry.techniques_used)) {
                    entry.techniques_used.forEach(tech => {
                        const trimmedTech = tech.trim();
                        if (trimmedTech) {
                            techniqueCounts[trimmedTech] = (techniqueCounts[trimmedTech] || 0) + 1;
                        }
                    });
                }
            });
        }

        const uniqueSpeciesCount = uniqueSpecies.size;
        const releaseRate = totalCaught > 0 ? (totalReleased / totalCaught) * 100 : null;

        let favoriteTechnique: string | null = null;
        let maxCount = 0;
        for (const tech in techniqueCounts) {
            if (techniqueCounts[tech] > maxCount) {
                maxCount = techniqueCounts[tech];
                favoriteTechnique = tech;
            }
        }

        // Determine most caught species
        let mostCaughtSpeciesId: string | null = null;
        let maxSpeciesCaught = 0;
        for (const speciesId in speciesCaughtCounts) {
            if (speciesCaughtCounts[speciesId] > maxSpeciesCaught) {
                maxSpeciesCaught = speciesCaughtCounts[speciesId];
                mostCaughtSpeciesId = speciesId;
            }
        }

        let mostCaughtSpeciesName: string | null = null;
        if (mostCaughtSpeciesId) {
            const { data: speciesData, error: speciesError } = await supabase
                .from('species_registry')
                .select('name')
                .eq('id', mostCaughtSpeciesId)
                .single();

            if (speciesError) {
                console.error("Error fetching most caught species name:", speciesError);
            } else if (speciesData) {
                mostCaughtSpeciesName = speciesData.name;
            }
        }

        // 2. Get fishing_sessions count
        const { count: totalSessions, error: sessionsError } = await supabase
            .from('fishing_sessions')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('status', 'completed'); // Only completed sessions

        if (sessionsError) {
            console.error("Error fetching fishing sessions count:", sessionsError);
            throw sessionsError;
        }

        return {
            totalCaught,
            uniqueSpeciesCount,
            biggestWeightKg,
            biggestSizeCm,
            releaseRate,
            mostCaughtSpecies: mostCaughtSpeciesName, // Return new stat
            favoriteTechnique,
            totalSessions: totalSessions || 0,
        };
    },

    async uploadAvatar(userId: string, uri: string) {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const filePath = `${userId}/${new Date().getTime()}.jpg`;
            const contentType = 'image/jpeg';

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(filePath, decode(base64), { contentType });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error("Erreur d'envoi de l'avatar:", error);
            throw error;
        }
    },

    async deleteAvatar(avatarUrl: string) {
        try {
            const fileName = avatarUrl.split('/').pop();
            if (!fileName) throw new Error("URL d'avatar invalide");

            const { error } = await supabase.storage.from(BUCKET).remove([fileName]);

            if (error) throw error;
        } catch (error) {
            console.error("Erreur de suppression de l'avatar:", error);
            throw error;
        }
    },
};
