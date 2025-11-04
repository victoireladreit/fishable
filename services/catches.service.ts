import { supabase } from '../config/supabase'
import { Database } from '../lib/types'

export type Catch = Database['public']['Tables']['catches']['Row']
export type CatchInsert = Database['public']['Tables']['catches']['Insert']
export type CatchUpdate = Database['public']['Tables']['catches']['Update']

const TABLE = 'catches'
const BUCKET = 'photos'

export const CatchesService = {
    async createCatch(data: CatchInsert) {
        const { data: newCatch, error } = await supabase.from(TABLE).insert(data).select().single()
        if (error) throw error
        return newCatch
    },

    async getCatchesBySession(sessionId: string) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    async deleteCatch(id: string) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id)
        if (error) throw error
        return true
    },

    // Upload photo vers Supabase Storage
    async uploadCatchPhoto(uri: string, userId: string) {
        const path = `${userId}/${Date.now()}.jpg`

        const response = await fetch(uri)
        const blob = await response.blob()

        const { data, error } = await supabase.storage.from(BUCKET).upload(path, blob, {
            contentType: 'image/jpeg',
        })

        if (error) throw error

        const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
        return publicUrl.publicUrl
    },
}
