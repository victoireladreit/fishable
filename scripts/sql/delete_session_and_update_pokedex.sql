
DECLARE
v_species_record RECORD;
    v_user_id uuid;
    v_deleted_catches_count INT;
    v_deleted_released_count INT;
    v_deleted_kept_count INT;
BEGIN
    -- 1. Get the user_id from the session being deleted
SELECT user_id INTO v_user_id FROM fishing_sessions WHERE id = p_session_id;

IF NOT FOUND OR v_user_id IS NULL THEN
DELETE FROM fishing_sessions WHERE id = p_session_id;
RETURN;
END IF;

    -- 2. Loop through each distinct species affected by this session deletion
FOR v_species_record IN
SELECT DISTINCT species_id FROM catches WHERE session_id = p_session_id AND species_id IS NOT NULL
    LOOP
        -- 3. Check if any catches for this species will remain for the user AFTER deletion
        IF NOT EXISTS (
            SELECT 1 FROM catches c
            JOIN fishing_sessions fs ON c.session_id = fs.id
            WHERE fs.user_id = v_user_id
              AND c.species_id = v_species_record.species_id
              AND c.session_id != p_session_id
        ) THEN
-- 4. No other catches exist, so simply delete the pokedex entry
DELETE FROM user_pokedex
WHERE user_id = v_user_id AND species_id = v_species_record.species_id;
ELSE
            -- 5. Other catches will remain, so we must fully recalculate the pokedex entry

            -- A) Calculate stats of the catches being deleted (for decrementing)
SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_released = true),
    COUNT(*) FILTER (WHERE is_released = false)
INTO
    v_deleted_catches_count,
    v_deleted_released_count,
    v_deleted_kept_count
FROM catches
WHERE session_id = p_session_id AND species_id = v_species_record.species_id;

-- B) Use a CTE and a single SELECT...INTO to recalculate everything
WITH remaining_catches AS (
    SELECT c.*, fs.region
    FROM catches c
             JOIN fishing_sessions fs ON c.session_id = fs.id
    WHERE fs.user_id = v_user_id
      AND c.species_id = v_species_record.species_id
      AND c.session_id != p_session_id
    )
UPDATE user_pokedex
SET
    total_caught = total_caught - v_deleted_catches_count,
    total_released = total_released - v_deleted_released_count,
    total_kept = total_kept - v_deleted_kept_count,

    first_catch_id = (SELECT id FROM remaining_catches ORDER BY caught_at ASC, id ASC LIMIT 1),
    first_caught_at = (SELECT caught_at FROM remaining_catches ORDER BY caught_at ASC, id ASC LIMIT 1),
    first_location_lat = (SELECT catch_location_lat FROM remaining_catches ORDER BY caught_at ASC, id ASC LIMIT 1),
    first_location_lng = (SELECT catch_location_lng FROM remaining_catches ORDER BY caught_at ASC, id ASC LIMIT 1),
    first_region = (SELECT region FROM remaining_catches ORDER BY caught_at ASC, id ASC LIMIT 1),

    biggest_catch_id = (SELECT id FROM remaining_catches ORDER BY size_cm DESC NULLS LAST, weight_kg DESC NULLS LAST, caught_at DESC, id DESC LIMIT 1),
    biggest_size_cm = (SELECT size_cm FROM remaining_catches ORDER BY size_cm DESC NULLS LAST, weight_kg DESC NULLS LAST, caught_at DESC, id DESC LIMIT 1),
    biggest_weight_kg = (SELECT weight_kg FROM remaining_catches ORDER BY size_cm DESC NULLS LAST, weight_kg DESC NULLS LAST, caught_at DESC, id DESC LIMIT 1),

    last_caught_at = (SELECT MAX(caught_at) FROM remaining_catches),
    average_size_cm = (SELECT AVG(size_cm) FROM remaining_catches),

    regions_caught = (SELECT ARRAY_AGG(DISTINCT region) FROM remaining_catches WHERE region IS NOT NULL),
    water_types_caught = (SELECT ARRAY_AGG(DISTINCT water_type) FROM remaining_catches WHERE water_type IS NOT NULL),
    habitat_types_caught = (SELECT ARRAY_AGG(DISTINCT habitat_type) FROM remaining_catches WHERE habitat_type IS NOT NULL),
    techniques_used = (SELECT ARRAY_AGG(DISTINCT technique) FROM remaining_catches WHERE technique IS NOT NULL),

    favorite_technique = (SELECT technique FROM remaining_catches WHERE technique IS NOT NULL GROUP BY technique ORDER BY COUNT(*) DESC, technique ASC LIMIT 1),
    best_season = (WITH seasons AS (SELECT CASE WHEN EXTRACT(month FROM caught_at) IN (12, 1, 2) THEN 'Winter' WHEN EXTRACT(month FROM caught_at) IN (3, 4, 5) THEN 'Spring' WHEN EXTRACT(month FROM caught_at) IN (6, 7, 8) THEN 'Summer' ELSE 'Autumn' END as season FROM remaining_catches WHERE caught_at IS NOT NULL) SELECT season FROM seasons GROUP BY season ORDER BY COUNT(*) DESC, season ASC LIMIT 1),
    best_time_of_day = (WITH times_of_day AS (SELECT CASE WHEN EXTRACT(hour FROM caught_at) >= 5 AND EXTRACT(hour FROM caught_at) < 12 THEN 'Morning' WHEN EXTRACT(hour FROM caught_at) >= 12 AND EXTRACT(hour FROM caught_at) < 17 THEN 'Afternoon' WHEN EXTRACT(hour FROM caught_at) >= 17 AND EXTRACT(hour FROM caught_at) < 21 THEN 'Evening' ELSE 'Night' END as time_of_day FROM remaining_catches WHERE caught_at IS NOT NULL) SELECT time_of_day FROM times_of_day GROUP BY time_of_day ORDER BY COUNT(*) DESC, time_of_day ASC LIMIT 1),

    updated_at = NOW()
WHERE
    user_id = v_user_id AND species_id = v_species_record.species_id;
END IF;
END LOOP;

    -- 6. Finally, now that the pokedex is clean, safely delete the session's data
DELETE FROM catches WHERE session_id = p_session_id;
DELETE FROM fishing_sessions WHERE id = p_session_id;

END;
