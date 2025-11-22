import { Database } from '../lib/types';
import { supabase } from "../config/supabase";
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchInsertPayload = Omit<Database['public']['Tables']['catches']['Insert'], 'species_id' | 'photo_url'> & { 
    species_name: string;
    photo_uri?: string | null;
};

const PHOTOS_BUCKET = 'fishable-catch-photos';

const getOrCreateSpecies = async (speciesName: string): Promise<string> => {
    const { data: existingSpecies, error: selectError } = await supabase
        .from('species_registry')
        .select('id')
        .ilike('name', speciesName)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
    }

    if (existingSpecies) {
        return existingSpecies.id;
    }

    const { data: newSpecies, error: insertError } = await supabase
        .from('species_registry')
        .insert({ name: speciesName, scientific_name: 'Unknown' })
        .select('id')
        .single();

    if (insertError) {
        throw insertError;
    }

    return newSpecies.id;
};

const uploadCatchPhoto = async (photoUri: string | null | undefined, sessionId: string): Promise<string | null> => {
    if (!photoUri) return null;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non authentifié.");

        const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: 'base64' });
        const filePath = `${user.id}/${sessionId}/${new Date().getTime()}.jpg`;
        const contentType = 'image/jpeg';

        const { error: uploadError } = await supabase.storage
            .from(PHOTOS_BUCKET)
            .upload(filePath, decode(base64), { contentType });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(filePath);
        return data.publicUrl;

    } catch (e) {
        console.error("Erreur d'envoi de la photo:", e);
        throw e;
    }
};

const addCatch = async (catchData: CatchInsertPayload): Promise<Catch> => {
    const { photo_uri, session_id, ...catchDetails } = catchData;

    const speciesId = await getOrCreateSpecies(catchDetails.species_name);
    const photoUrl = await uploadCatchPhoto(photo_uri, session_id);

    const { data, error } = await supabase
        .from('catches')
        .insert({ 
            ...catchDetails,
            session_id,
            species_id: speciesId,
            photo_url: photoUrl,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data;
};

const getCatchesBySession = async (sessionId: string): Promise<Catch[]> => {
    const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('session_id', sessionId)
        .order('caught_at', { ascending: false });

    if (error) {
        throw error;
    }
    return data;
};

export const CatchesService = {
    addCatch,
    getCatchesBySession,
};
