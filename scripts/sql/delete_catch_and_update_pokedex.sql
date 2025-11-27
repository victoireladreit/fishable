CREATE OR REPLACE FUNCTION public.delete_catch_and_update_pokedex(p_catch_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
v_catch public.catches%ROWTYPE; -- Correction de la déclaration
    v_user_id uuid;
    v_species_id uuid;
BEGIN
    -- 1. Get the details of the catch to be deleted
SELECT * INTO v_catch FROM public.catches WHERE id = p_catch_id;

IF NOT FOUND THEN
        -- The catch is already gone, nothing to do.
        RETURN;
END IF;

    -- 2. Get the user ID and species ID directly from the catch itself.
    v_user_id := v_catch.user_id;
    v_species_id := v_catch.species_id;

    -- If for some reason the catch has no user, we can't proceed with pokedex updates.
    -- Just delete the catch and exit.
    IF v_user_id IS NULL THEN
DELETE FROM public.catches WHERE id = p_catch_id;
RETURN;
END IF;

    -- 3. IMPORTANT: Nullify references to this catch in user_pokedex BEFORE deleting.
UPDATE public.user_pokedex
SET
    biggest_catch_id = CASE WHEN biggest_catch_id = p_catch_id THEN NULL ELSE biggest_catch_id END,
    first_catch_id = CASE WHEN first_catch_id = p_catch_id THEN NULL ELSE first_catch_id END
WHERE user_id = v_user_id AND species_id = v_species_id;

-- 4. Now, safely delete the catch.
DELETE FROM public.catches WHERE id = p_catch_id;

-- 5. Finally, trigger the master recalculation function to fix the pokedex entry.
PERFORM public.recalculate_pokedex_for_species(v_user_id, v_species_id);

END;
$function$;