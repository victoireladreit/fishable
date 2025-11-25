import { Database } from '../lib/types';
import { supabase } from "../config/supabase";
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchInsertPayload = Omit<Database['public']['Tables']['catches']['Insert'], 'species_id' | 'photo_url' | 'user_id'> & { 
    species_name: string;
    photo_uri?: string | null;
    catch_location_lat?: number | null;
    catch_location_lng?: number | null;
    catch_location_accuracy?: number | null; // AJOUTÉ
};
type CatchUpdatePayload = Omit<Database['public']['Tables']['catches']['Update'], 'species_id' | 'photo_url' | 'user_id'> & { 
    species_name?: string;
    photo_uri?: string | null;
    catch_location_lat?: number | null;
    catch_location_lng?: number | null;
    catch_location_accuracy?: number | null; // AJOUTÉ
};

const PHOTOS_BUCKET = 'fishable-catch-photos';

const uploadCatchPhoto = async (photoUri: string | null | undefined, sessionId: string): Promise<string | null> => {
    if (!photoUri) {
        return null;
    }

    if (photoUri.startsWith('http')) {
        return photoUri;
    }

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié.");

    const { photo_uri, session_id, species_name, catch_location_lat, catch_location_lng, catch_location_accuracy, ...catchDetails } = catchData;

    const photoUrl = await uploadCatchPhoto(photo_uri, session_id);

    const { data, error } = await supabase.rpc('add_catch_and_update_pokedex', {
        p_session_id: session_id,
        p_catch_data: {
            ...catchDetails,
            user_id: user.id, // AJOUTÉ: Ajout de l'ID utilisateur
            species_name,
            photo_url: photoUrl,
            catch_location_lat,
            catch_location_lng,
            catch_location_accuracy, // AJOUTÉ
        }
    });

    if (error) {
        throw error;
    }
    return data;
};

const updateCatch = async (id: string, catchData: CatchUpdatePayload): Promise<void> => {
    const { photo_uri, session_id, catch_location_lat, catch_location_lng, catch_location_accuracy, ...catchDetails } = catchData;
    
    // Note: user_id is not updated here as it's typically immutable for a catch.
    // If photo_uri is provided, it implies a new photo upload, which needs a session_id for pathing.
    const photoUrl = await uploadCatchPhoto(photo_uri, session_id!);

    const updates = {
        ...catchDetails,
        photo_url: photoUrl,
        catch_location_lat,
        catch_location_lng,
        catch_location_accuracy, // AJOUTÉ
    };

    const { error } = await supabase.rpc('update_catch_and_pokedex', {
        p_catch_id: id,
        p_updates: updates,
    });

    if (error) {
        throw error;
    }
};

const deleteCatch = async (catchId: string): Promise<void> => {
    const { error } = await supabase.rpc('delete_catch_and_update_pokedex', {
        p_catch_id: catchId,
    });

    if (error) {
        throw error;
    }
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

const getCatchesByUserId = async (userId: string): Promise<Catch[]> => {
    const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('user_id', userId)
        .order('caught_at', { ascending: false });

    if (error) {
        throw error;
    }
    return data;
};

const getCatchById = async (id: string): Promise<Catch | null> => {
    const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }
    return data;
};

export const CatchesService = {
    addCatch,
    updateCatch,
    deleteCatch,
    getCatchesBySession,
    getCatchesByUserId,
    getCatchById,
};
