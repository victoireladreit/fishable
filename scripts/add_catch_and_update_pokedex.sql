CREATE OR REPLACE FUNCTION public.add_catch_and_update_pokedex(
    p_session_id uuid,
    p_catch_data jsonb
)
RETURNS SETOF public.catches
LANGUAGE plpgsql
AS $function$
DECLARE
v_new_catch_id uuid;
    v_user_id uuid;
    v_species_id uuid;
    v_species_name text := p_catch_data->>'species_name';
BEGIN
    -- 1. Get user_id from session
SELECT user_id INTO v_user_id FROM fishing_sessions WHERE id = p_session_id;
IF NOT FOUND THEN
        RAISE EXCEPTION 'Session with ID % not found', p_session_id;
END IF;

    -- 2. Get or create species
SELECT id INTO v_species_id FROM species_registry WHERE name = v_species_name;
IF NOT FOUND THEN
        INSERT INTO species_registry (name, scientific_name)
        VALUES (v_species_name, 'Unknown')
        RETURNING id INTO v_species_id;
END IF;

    -- 3. Insert the new catch
INSERT INTO catches (
    session_id,
    species_id,
    species_name,
    size_cm,
    weight_kg,
    technique,
    lure_name,
    lure_color,
    rod_type,
    water_depth_m,
    habitat_type,
    water_type,
    structure,
    fight_duration_minutes,
    is_released,
    notes,
    photo_url,
    caught_at,
    catch_location_lat,
    catch_location_lng,
    catch_location_accuracy -- NOUVEAU
)
VALUES (
           p_session_id,
           v_species_id,
           v_species_name,
           (p_catch_data->>'size_cm')::numeric,
           (p_catch_data->>'weight_kg')::numeric,
           p_catch_data->>'technique',
           p_catch_data->>'lure_name',
           p_catch_data->>'lure_color',
           p_catch_data->>'rod_type',
           (p_catch_data->>'water_depth_m')::numeric,
           p_catch_data->>'habitat_type',
           p_catch_data->>'water_type',
           p_catch_data->>'structure',
           (p_catch_data->>'fight_duration_minutes')::integer,
           (p_catch_data->>'is_released')::boolean,
           p_catch_data->>'notes',
           p_catch_data->>'photo_url',
           (p_catch_data->>'caught_at')::timestamptz,
           (p_catch_data->>'catch_location_lat')::real,
           (p_catch_data->>'catch_location_lng')::real,
           (p_catch_data->>'catch_location_accuracy')::real -- NOUVEAU
       )
    RETURNING id INTO v_new_catch_id;

-- 4. Recalculate fishlog for the affected species
PERFORM public.recalculate_pokedex_for_species(v_user_id, v_species_id);

    -- 5. Return the newly created catch
RETURN QUERY SELECT * FROM catches WHERE id = v_new_catch_id;
END;
$function$;