import { supabase } from '../config/supabase';
import { Database } from '../lib/types';

export type TargetSpeciesInsert = Database['public']['Tables']['target_species']['Insert'];

const TABLE = 'target_species';

export const TargetSpeciesService = {
    async createTargetSpecies(targetSpecies: TargetSpeciesInsert[]) {
        const { data, error } = await supabase.from(TABLE).insert(targetSpecies).select();
        if (error) throw error;
        return data;
    },

    async getTargetSpeciesBySessionId(sessionId: string) {
        const { data, error } = await supabase.from(TABLE).select('species_name').eq('session_id', sessionId);
        if (error) throw error;
        return data.map(ts => ts.species_name);
    },
};
