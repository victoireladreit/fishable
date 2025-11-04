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
        const { error } = await supabase.from(TABLE).delete().eq('id', id)
        if (error) throw error
        return true
    },
}
