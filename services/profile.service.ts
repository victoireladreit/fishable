import { supabase } from '../config/supabase';
import { Database } from '../lib/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const TABLE = 'profiles';

export const ProfileService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows
            throw error;
        }
        return data;
    },

    async updateProfile(userId: string, updates: ProfileUpdate) {
        const { data, error } = await supabase
            .from(TABLE)
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    },
};
