CREATE OR REPLACE FUNCTION public.add_catch_and_update_pokedex(
    p_user_id uuid,
    p_session_id uuid,
    p_catch_data jsonb
)
RETURNS SETOF public.catches
LANGUAGE plpgsql
AS $function$
DECLARE
    v_new_catch_id uuid;
    v_species_id uuid;
    v_species_name text := p_catch_data->>'species_name';
    v_region text;
BEGIN
    -- Log the incoming p_catch_data for debugging
    RAISE NOTICE 'Incoming p_catch_data: %', p_catch_data;

    -- 1. Ensure user_id is not null
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required for adding a catch.';
    END IF;

    -- 2. Get region if session exists
    IF p_session_id IS NOT NULL THEN
        SELECT region INTO v_region FROM fishing_sessions WHERE id = p_session_id;
    END IF;

    -- 3. Get or create species
    SELECT id INTO v_species_id FROM species_registry WHERE name = v_species_name;
    IF NOT FOUND THEN
        INSERT INTO species_registry (name, scientific_name)
        VALUES (v_species_name, 'Unknown')
        RETURNING id INTO v_species_id;
    END IF;

    -- 4. Insert the new catch
    INSERT INTO catches (
        session_id, user_id, species_id, species_name, size_cm, weight_kg, technique,
        lure_name, lure_color, rod_type, water_depth_m, habitat_type, water_type,
        structure, fight_duration_minutes, is_released, notes, photo_url, caught_at,
        catch_location_lat, catch_location_lng
    )
    VALUES (
        p_session_id, p_user_id, v_species_id, v_species_name,
        (p_catch_data->>'size_cm')::numeric, (p_catch_data->>'weight_kg')::numeric, p_catch_data->>'technique',
        p_catch_data->>'lure_name', p_catch_data->>'lure_color', p_catch_data->>'rod_type',
        (p_catch_data->>'water_depth_m')::numeric, p_catch_data->>'habitat_type', p_catch_data->>'water_type',
        p_catch_data->>'structure', (p_catch_data->>'fight_duration_minutes')::integer,
        (p_catch_data->>'is_released')::boolean, p_catch_data->>'notes', p_catch_data->>'photo_url',
        (p_catch_data->>'caught_at')::timestamptz, (p_catch_data->>'catch_location_lat')::real,
        (p_catch_data->>'catch_location_lng')::real
    )
    RETURNING id INTO v_new_catch_id;

    -- 5. Recalculate and update pokedex entry directly in this function
    WITH all_catches AS (
        SELECT c.*, fs.region
        FROM catches c
        LEFT JOIN fishing_sessions fs ON c.session_id = fs.id
        WHERE c.user_id = p_user_id AND c.species_id = v_species_id
    ),
    first_catch AS (
        SELECT * FROM all_catches
        WHERE caught_at IS NOT NULL
        ORDER BY caught_at ASC, created_at ASC, id ASC
        LIMIT 1
    ),
    biggest_catch AS (
        SELECT * FROM all_catches
        ORDER BY size_cm DESC NULLS LAST, weight_kg DESC NULLS LAST, caught_at DESC, id DESC
        LIMIT 1
    )
    INSERT INTO user_pokedex (
        user_id, species_id, first_caught_at, first_catch_id, first_location_lat, first_location_lng, first_region,
        total_caught, total_released, total_kept,
        biggest_size_cm, biggest_weight_kg, biggest_catch_id,
        last_caught_at, average_size_cm,
        regions_caught, water_types_caught, habitat_types_caught, techniques_used,
        favorite_technique, best_season, best_time_of_day,
        created_at, updated_at
    )
    SELECT
        p_user_id, v_species_id,
        fc.caught_at, fc.id, fc.catch_location_lat, fc.catch_location_lng, fc.region,
        (SELECT COUNT(*) FROM all_catches),
        (SELECT COUNT(*) FROM all_catches WHERE is_released = true),
        (SELECT COUNT(*) FROM all_catches WHERE is_released = false),
        bc.size_cm, bc.weight_kg, bc.id,
        (SELECT MAX(caught_at) FROM all_catches),
        (SELECT AVG(size_cm) FROM all_catches WHERE size_cm IS NOT NULL),
        (SELECT ARRAY_AGG(DISTINCT region) FROM all_catches WHERE region IS NOT NULL),
        (SELECT ARRAY_AGG(DISTINCT water_type) FROM all_catches WHERE water_type IS NOT NULL),
        (SELECT ARRAY_AGG(DISTINCT habitat_type) FROM all_catches WHERE habitat_type IS NOT NULL),
        (SELECT ARRAY_AGG(DISTINCT technique) FROM all_catches WHERE technique IS NOT NULL),
        (SELECT technique FROM all_catches WHERE technique IS NOT NULL GROUP BY technique ORDER BY COUNT(*) DESC, technique ASC LIMIT 1),
        (WITH seasons AS (SELECT CASE WHEN EXTRACT(month FROM caught_at) IN (12, 1, 2) THEN 'Winter' WHEN EXTRACT(month FROM caught_at) IN (3, 4, 5) THEN 'Spring' WHEN EXTRACT(month FROM caught_at) IN (6, 7, 8) THEN 'Summer' ELSE 'Autumn' END as season FROM all_catches WHERE caught_at IS NOT NULL) SELECT season FROM seasons GROUP BY season ORDER BY COUNT(*) DESC, season ASC LIMIT 1),
        (WITH times_of_day AS (SELECT CASE WHEN EXTRACT(hour FROM caught_at) >= 5 AND EXTRACT(hour FROM caught_at) < 12 THEN 'Morning' WHEN EXTRACT(hour FROM caught_at) >= 12 AND EXTRACT(hour FROM caught_at) < 17 THEN 'Afternoon' WHEN EXTRACT(hour FROM caught_at) >= 17 AND EXTRACT(hour FROM caught_at) < 21 THEN 'Evening' ELSE 'Night' END as time_of_day FROM all_catches WHERE caught_at IS NOT NULL) SELECT time_of_day FROM times_of_day GROUP BY time_of_day ORDER BY COUNT(*) DESC, time_of_day ASC LIMIT 1),
        NOW(), NOW()
    FROM first_catch fc, biggest_catch bc
    ON CONFLICT (user_id, species_id) DO UPDATE SET
        total_caught = EXCLUDED.total_caught,
        total_released = EXCLUDED.total_released,
        total_kept = EXCLUDED.total_kept,
        biggest_size_cm = EXCLUDED.biggest_size_cm,
        biggest_weight_kg = EXCLUDED.biggest_weight_kg,
        biggest_catch_id = EXCLUDED.biggest_catch_id,
        last_caught_at = EXCLUDED.last_caught_at,
        average_size_cm = EXCLUDED.average_size_cm,
        regions_caught = EXCLUDED.regions_caught,
        water_types_caught = EXCLUDED.water_types_caught,
        habitat_types_caught = EXCLUDED.habitat_types_caught,
        techniques_used = EXCLUDED.techniques_used,
        favorite_technique = EXCLUDED.favorite_technique,
        best_season = EXCLUDED.best_season,
        best_time_of_day = EXCLUDED.best_time_of_day,
        updated_at = NOW();

    -- 6. Return the newly created catch
    RETURN QUERY SELECT * FROM catches WHERE id = v_new_catch_id;
END;
$function$;