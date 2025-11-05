import { supabase } from '../config/supabase';
import { Database } from '../lib/types';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

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
        const { data, error } = await supabase
            .from(TABLE)
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
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
