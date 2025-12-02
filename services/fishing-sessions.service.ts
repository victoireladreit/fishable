import { supabase } from '../config/supabase'
import { Database } from '../lib/types'

export type FishingSession = Database['public']['Tables']['fishing_sessions']['Row']
export type FishingSessionInsert = Database['public']['Tables']['fishing_sessions']['Insert']
export type FishingSessionUpdate = Database['public']['Tables']['fishing_sessions']['Update']

const TABLE = 'fishing_sessions'

export const FishingSessionsService = {
    async createSession(data: FishingSessionInsert) {
        const { data: session, error } = await supabase
            .from(TABLE)
            .insert(data)
            .select()
            .single()

        if (error) throw error
        return session
    },

    async getSessionById(id: string) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
        if (error) throw error
        return data
    },

    async getSessions(params: { userId: string; status?: 'active' | 'completed' }) {
        let query = supabase
            .from(TABLE)
            .select('*')
            .eq('user_id', params.userId)
            .order('created_at', { ascending: false })

        if (params.status) {
            query = query.eq('status', params.status)
        }

        const { data, error } = await query
        if (error) throw error;
        return data
    },

    async getPublishedSessions() {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .not('published_at', 'is', null)
            .order('published_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateSession(id: string, updates: FishingSessionUpdate) {
        const { data, error } = await supabase
            .from(TABLE)
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async deleteSession(id: string) {
        const { error } = await supabase.rpc('delete_session_and_update_pokedex', {
            p_session_id: id,
        })

        if (error) {
            console.error("Error deleting session with RPC:", error)
            throw error
        }

        return true
    },

    async getCatchesCountBySessionId(sessionId: string): Promise<number> {
        const { count, error } = await supabase
            .from('catches')
            .select('*', { count: 'exact' })
            .eq('session_id', sessionId);

        if (error) {
            console.error("Error fetching catches count:", error);
            throw error;
        }
        return count || 0;
    },
}
