import { supabase } from '../config/supabase'
import { Database } from '../lib/types'

export type Species = Database['public']['Tables']['species_registry']['Row']

const TABLE = 'species'

export const SpeciesService = {
    async getAllSpecies() {
        const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true })
        if (error) throw error
        return data
    },

    async searchSpecies(query: string) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10)
        if (error) throw error
        return data
    },

    async getSpeciesById(id: string) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
        if (error) throw error
        return data
    },
}
