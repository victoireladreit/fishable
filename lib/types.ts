export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            catches: {
                Row: {
                    id: string
                    session_id: string | null
                    user_id: string
                    species_id: string | null
                    species_name: string
                    size_cm: number | null
                    weight_kg: number | null
                    technique: string | null
                    lure_name: string | null
                    lure_color: string | null
                    rod_type: string | null
                    catch_location_lat: number | null
                    catch_location_lng: number | null
                    water_depth_m: number | null
                    habitat_type: string | null
                    water_type: 'fresh' | 'salt' | 'brackish' | null
                    structure: string | null
                    caught_at: string | null
                    fight_duration_minutes: number | null
                    is_released: boolean | null
                    photo_url: string | null
                    video_url: string | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    session_id?: string | null
                    user_id: string // AJOUTÉ
                    species_id?: string | null
                    species_name: string
                    size_cm?: number | null
                    weight_kg?: number | null
                    technique?: string | null
                    lure_name?: string | null
                    lure_color?: string | null
                    rod_type?: string | null
                    catch_location_lat?: number | null
                    catch_location_lng?: number | null
                    water_depth_m?: number | null
                    habitat_type?: string | null
                    water_type?: 'fresh' | 'salt' | 'brackish' | null
                    structure?: string | null
                    caught_at?: string | null
                    fight_duration_minutes?: number | null
                    is_released?: boolean | null
                    photo_url?: string | null
                    video_url?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    session_id?: string | null
                    user_id?: string // AJOUTÉ
                    species_id?: string | null
                    species_name?: string
                    size_cm?: number | null
                    weight_kg?: number | null
                    technique?: string | null
                    lure_name?: string | null
                    lure_color?: string | null
                    rod_type?: string | null
                    catch_location_lat?: number | null
                    catch_location_lng?: number | null
                    water_depth_m?: number | null
                    habitat_type?: string | null
                    water_type?: 'fresh' | 'salt' | 'brackish' | null
                    structure?: string | null
                    caught_at?: string | null
                    fight_duration_minutes?: number | null
                    is_released?: boolean | null
                    photo_url?: string | null
                    video_url?: string | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            comments: {
                Row: {
                    id: string
                    user_id: string
                    session_id: string
                    content: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_id: string
                    content: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    session_id?: string
                    content?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            fishing_sessions: {
                Row: {
                    id: string
                    user_id: string
                    started_at: string
                    ended_at: string | null
                    duration_minutes: number | null
                    location_lat: number | null
                    location_lng: number | null
                    location_name: string | null
                    location_visibility: 'public' | 'region' | 'private' | null
                    region: string | null
                    distance_km: number | null
                    weather_temp: number | null
                    weather_conditions: string | null
                    water_color: string | null
                    water_current: string | null
                    wind_strength: 'calm' | 'light' | 'moderate' | 'strong' | null
                    wind_speed_kmh: number | null
                    water_level: 'normal' | 'high' | 'flood' | null
                    status: 'active' | 'completed' | 'draft' | null
                    caption: string | null
                    is_published: boolean | null
                    created_at: string | null
                    updated_at: string | null
                    route: Json | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    started_at: string
                    ended_at?: string | null
                    duration_minutes?: number | null
                    location_lat?: number | null
                    location_lng?: number | null
                    location_name?: string | null
                    location_visibility?: 'public' | 'region' | 'private' | null
                    region?: string | null
                    distance_km?: number | null
                    weather_temp?: number | null
                    weather_conditions?: string | null
                    water_color?: string | null
                    water_current?: string | null
                    wind_strength?: 'calm' | 'light' | 'moderate' | 'strong' | null
                    wind_speed_kmh?: number | null
                    water_level?: 'normal' | 'high' | 'flood' | null
                    status?: 'active' | 'completed' | 'draft' | null
                    caption?: string | null
                    is_published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    route?: Json | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    started_at?: string
                    ended_at?: string | null
                    duration_minutes?: number | null
                    location_lat?: number | null
                    location_lng?: number | null
                    location_name?: string | null
                    location_visibility?: 'public' | 'region' | 'private' | null
                    region?: string | null
                    distance_km?: number | null
                    weather_temp?: number | null
                    weather_conditions?: string | null
                    water_color?: string | null
                    water_current?: string | null
                    wind_strength?: 'calm' | 'light' | 'moderate' | 'strong' | null
                    wind_speed_kmh?: number | null
                    water_level?: 'normal' | 'high' | 'flood' | null
                    status?: 'active' | 'completed' | 'draft' | null
                    caption?: string | null
                    is_published?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    route?: Json | null
                }
            }
            likes: {
                Row: {
                    id: string
                    user_id: string
                    session_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    session_id?: string
                    created_at?: string | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username: string
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            session_photos: {
                Row: {
                    id: string
                    session_id: string
                    photo_url: string
                    caption: string | null
                    order_index: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    session_id: string
                    photo_url: string
                    caption?: string | null
                    order_index?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    session_id?: string
                    photo_url?: string
                    caption?: string | null
                    order_index?: number | null
                    created_at?: string | null
                }
            }
            species_registry: {
                Row: {
                    id: string
                    name: string
                    name_en: string | null
                    scientific_name: string
                    common_names: Json | null
                    family: string | null
                    category: string | null
                    habitat_types: string[] | null
                    water_types: string[] | null
                    depth_range_min: number | null
                    depth_range_max: number | null
                    temperature_range_min: number | null
                    temperature_range_max: number | null
                    geographic_zones: string[] | null
                    countries: string[] | null
                    fao_zones: string[] | null
                    average_size_cm: number | null
                    max_size_cm: number | null
                    average_weight_kg: number | null
                    max_weight_kg: number | null
                    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | null
                    icon_url: string | null
                    photo_url: string | null
                    description: string | null
                    fishbase_id: number | null
                    gbif_id: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    name_en?: string | null
                    scientific_name: string
                    common_names?: Json | null
                    family?: string | null
                    category?: 'freshwater' | 'saltwater' | 'brackish' | 'migratory' | null
                    habitat_types?: string[] | null
                    water_types?: string[] | null
                    depth_range_min?: number | null
                    depth_range_max?: number | null
                    temperature_range_min?: number | null
                    temperature_range_max?: number | null
                    geographic_zones?: string[] | null
                    countries?: string[] | null
                    fao_zones?: string[] | null
                    average_size_cm?: number | null
                    max_size_cm?: number | null
                    average_weight_kg?: number | null
                    max_weight_kg?: number | null
                    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | null
                    icon_url?: string | null
                    photo_url?: string | null
                    description?: string | null
                    fishbase_id?: number | null
                    gbif_id?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    name_en?: string | null
                    scientific_name?: string
                    common_names?: Json | null
                    family?: string | null
                    category?: 'freshwater' | 'saltwater' | 'brackish' | 'migratory' | null
                    habitat_types?: string[] | null
                    water_types?: string[] | null
                    depth_range_min?: number | null
                    depth_range_max?: number | null
                    temperature_range_min?: number | null
                    temperature_range_max?: number | null
                    geographic_zones?: string[] | null
                    countries?: string[] | null
                    fao_zones?: string[] | null
                    average_size_cm?: number | null
                    max_size_cm?: number | null
                    average_weight_kg?: number | null
                    max_weight_kg?: number | null
                    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | null
                    icon_url?: string | null
                    photo_url?: string | null
                    description?: string | null
                    fishbase_id?: number | null
                    gbif_id?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            target_species: {
                Row: {
                    id: string
                    session_id: string
                    species_name: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    session_id: string
                    species_name: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    session_id?: string
                    species_name?: string
                    created_at?: string | null
                }
            }
            user_pokedex: {
                Row: {
                    id: string
                    user_id: string
                    species_id: string
                    first_caught_at: string
                    first_catch_id: string | null
                    first_location_lat: number | null
                    first_location_lng: number | null
                    first_region: string | null
                    total_caught: number | null
                    total_released: number | null
                    total_kept: number | null
                    biggest_size_cm: number | null
                    biggest_weight_kg: number | null
                    biggest_catch_id: string | null
                    regions_caught: string[] | null
                    countries_caught: string[] | null
                    water_types_caught: string[] | null
                    habitat_types_caught: string[] | null
                    techniques_used: string[] | null
                    favorite_technique: string | null
                    average_size_cm: number | null
                    catch_rate: number | null
                    best_season: string | null
                    best_time_of_day: string | null
                    rarity_badge: string | null
                    achievement_unlocked: string[] | null
                    is_public: boolean | null
                    show_locations: boolean | null
                    last_caught_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    species_id: string
                    first_caught_at: string
                    first_catch_id?: string | null
                    first_location_lat?: number | null
                    first_location_lng?: number | null
                    first_region?: string | null
                    total_caught?: number | null
                    total_released?: number | null
                    total_kept?: number | null
                    biggest_size_cm?: number | null
                    biggest_weight_kg?: number | null
                    biggest_catch_id?: string | null
                    regions_caught?: string[] | null
                    countries_caught?: string[] | null
                    water_types_caught?: string[] | null
                    habitat_types_caught?: string[] | null
                    techniques_used?: string[] | null
                    favorite_technique?: string | null
                    average_size_cm?: number | null
                    catch_rate?: number | null
                    best_season?: string | null
                    best_time_of_day?: string | null
                    rarity_badge?: string | null
                    achievement_unlocked?: string[] | null
                    is_public?: boolean | null
                    show_locations?: boolean | null
                    last_caught_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    species_id?: string
                    first_caught_at?: string
                    first_catch_id?: string | null
                    first_location_lat?: number | null
                    first_location_lng?: number | null
                    first_region?: string | null
                    total_caught?: number | null
                    total_released?: number | null
                    total_kept?: number | null
                    biggest_size_cm?: number | null
                    biggest_weight_kg?: number | null
                    biggest_catch_id?: string | null
                    regions_caught?: string[] | null
                    countries_caught?: string[] | null
                    water_types_caught?: string[] | null
                    habitat_types_caught?: string[] | null
                    techniques_used?: string[] | null
                    favorite_technique?: string | null
                    average_size_cm?: number | null
                    catch_rate?: number | null
                    best_season?: string | null
                    best_time_of_day?: string | null
                    rarity_badge?: string | null
                    achievement_unlocked?: string[] | null
                    is_public?: boolean | null
                    show_locations?: boolean | null
                    last_caught_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
