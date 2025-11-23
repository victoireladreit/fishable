CREATE OR REPLACE FUNCTION public.update_catch_and_pokedex(
    p_catch_id uuid,
    p_updates jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
v_old_catch catches%ROWTYPE;
    v_new_catch catches%ROWTYPE;
    v_user_id uuid;
    v_new_species_id uuid;
BEGIN
    -- 1. Get the current state of the catch
SELECT * INTO v_old_catch
FROM catches
WHERE id = p_catch_id;

IF NOT FOUND THEN
        RAISE EXCEPTION 'Catch with ID % not found', p_catch_id;
END IF;

    -- 2. Get the user ID from the associated session
SELECT user_id INTO v_user_id
FROM fishing_sessions
WHERE id = v_old_catch.session_id;

IF NOT FOUND THEN
        RAISE EXCEPTION 'Session with ID % for catch % not found', v_old_catch.session_id, p_catch_id;
END IF;

    -- 3. Apply updates using COALESCE to preserve old values if new ones are not provided
    v_new_catch := v_old_catch;
    v_new_catch.species_name := COALESCE(p_updates->>'species_name', v_old_catch.species_name);
    v_new_catch.size_cm := COALESCE((p_updates->>'size_cm')::numeric, v_old_catch.size_cm);
    v_new_catch.weight_kg := COALESCE((p_updates->>'weight_kg')::numeric, v_old_catch.weight_kg);
    v_new_catch.technique := COALESCE(p_updates->>'technique', v_old_catch.technique);
    v_new_catch.lure_name := COALESCE(p_updates->>'lure_name', v_old_catch.lure_name);
    v_new_catch.lure_color := COALESCE(p_updates->>'lure_color', v_old_catch.lure_color);
    v_new_catch.rod_type := COALESCE(p_updates->>'rod_type', v_old_catch.rod_type);
    v_new_catch.water_depth_m := COALESCE((p_updates->>'water_depth_m')::numeric, v_old_catch.water_depth_m);
    v_new_catch.habitat_type := COALESCE(p_updates->>'habitat_type', v_old_catch.habitat_type);
    v_new_catch.water_type := COALESCE(p_updates->>'water_type', v_old_catch.water_type);
    v_new_catch.structure := COALESCE(p_updates->>'structure', v_old_catch.structure);
    v_new_catch.fight_duration_minutes := COALESCE((p_updates->>'fight_duration_minutes')::integer, v_old_catch.fight_duration_minutes);
    v_new_catch.is_released := COALESCE((p_updates->>'is_released')::boolean, v_old_catch.is_released);
    v_new_catch.notes := COALESCE(p_updates->>'notes', v_old_catch.notes);
    v_new_catch.photo_url := COALESCE(p_updates->>'photo_url', v_old_catch.photo_url);
    v_new_catch.caught_at := COALESCE((p_updates->>'caught_at')::timestamptz, v_old_catch.caught_at);
    v_new_catch.catch_location_lat := COALESCE((p_updates->>'catch_location_lat')::real, v_old_catch.catch_location_lat);
    v_new_catch.catch_location_lng := COALESCE((p_updates->>'catch_location_lng')::real, v_old_catch.catch_location_lng);
    v_new_catch.catch_location_accuracy := COALESCE((p_updates->>'catch_location_accuracy')::real, v_old_catch.catch_location_accuracy); -- NOUVEAU
    v_new_catch.updated_at := NOW();

    -- 4. Get or create the new species ID
SELECT id INTO v_new_species_id FROM species_registry WHERE name = v_new_catch.species_name;
IF NOT FOUND THEN
        INSERT INTO species_registry (name, scientific_name)
        VALUES (v_new_catch.species_name, 'Unknown')
        RETURNING id INTO v_new_species_id;
END IF;
    v_new_catch.species_id := v_new_species_id;

    -- 5. Update the actual catch record
UPDATE catches SET
                   species_id = v_new_catch.species_id,
                   species_name = v_new_catch.species_name,
                   size_cm = v_new_catch.size_cm,
                   weight_kg = v_new_catch.weight_kg,
                   technique = v_new_catch.technique,
                   lure_name = v_new_catch.lure_name,
                   lure_color = v_new_catch.lure_color,
                   rod_type = v_new_catch.rod_type,
                   water_depth_m = v_new_catch.water_depth_m,
                   habitat_type = v_new_catch.habitat_type,
                   water_type = v_new_catch.water_type,
                   structure = v_new_catch.structure,
                   fight_duration_minutes = v_new_catch.fight_duration_minutes,
                   is_released = v_new_catch.is_released,
                   notes = v_new_catch.notes,
                   photo_url = v_new_catch.photo_url,
                   caught_at = v_new_catch.caught_at,
                   catch_location_lat = v_new_catch.catch_location_lat,
                   catch_location_lng = v_new_catch.catch_location_lng,
                   catch_location_accuracy = v_new_catch.catch_location_accuracy, -- NOUVEAU
                   updated_at = v_new_catch.updated_at
WHERE id = p_catch_id;

-- 6. Trigger recalculation for the affected pokedex entries
PERFORM public.recalculate_pokedex_for_species(v_user_id, v_old_catch.species_id);

    IF v_new_species_id IS DISTINCT FROM v_old_catch.species_id THEN
        PERFORM public.recalculate_pokedex_for_species(v_user_id, v_new_species_id);
END IF;

END;
$function$;