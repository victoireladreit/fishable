
DECLARE
v_catch_count INT;
    v_dated_catch_exists BOOLEAN;
BEGIN
    -- 1. Count remaining catches for this user and species
SELECT COUNT(*) INTO v_catch_count
FROM catches c
WHERE c.user_id = p_user_id AND c.species_id = p_species_id;

-- 2. If no catches remain at all, delete the fishlog entry and exit.
IF v_catch_count = 0 THEN
DELETE FROM user_pokedex WHERE user_id = p_user_id AND species_id = p_species_id;
RETURN;
END IF;

    -- 3. Check if at least one of the remaining catches has a non-null date.
SELECT EXISTS (
    SELECT 1
    FROM catches c
    WHERE c.user_id = p_user_id AND c.species_id = p_species_id AND c.caught_at IS NOT NULL
) INTO v_dated_catch_exists;

-- 4. If no dated catches exist, we cannot satisfy the NOT NULL constraint for first_caught_at.
-- The only logical action is to remove the fishlog entry.
IF NOT v_dated_catch_exists THEN
DELETE FROM user_pokedex WHERE user_id = p_user_id AND species_id = p_species_id;
RETURN;
END IF;

    -- 5. If we get here, catches exist AND at least one has a date. Proceed with full recalculation.
WITH remaining_catches AS (
    SELECT c.*, fs.region
    FROM catches c
             LEFT JOIN fishing_sessions fs ON c.session_id = fs.id
    WHERE c.user_id = p_user_id AND c.species_id = p_species_id
),
     first_catch AS (
         SELECT * FROM remaining_catches
         WHERE caught_at IS NOT NULL
         ORDER BY caught_at ASC, created_at ASC, id ASC
    LIMIT 1
    ),
    biggest_catch AS (
SELECT * FROM remaining_catches
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
    p_user_id,
    p_species_id,
    -- First Catch Info (calculated only on insert)
    fc.caught_at,
    fc.id,
    fc.catch_location_lat,
    fc.catch_location_lng,
    fc.region,

    -- Aggregates
    (SELECT COUNT(*) FROM remaining_catches),
    (SELECT COUNT(*) FROM remaining_catches WHERE is_released = true),
    (SELECT COUNT(*) FROM remaining_catches WHERE is_released = false),

    -- Biggest Catch Info
    bc.size_cm,
    bc.weight_kg,
    bc.id,

    -- More Aggregates
    (SELECT MAX(caught_at) FROM remaining_catches),
    (SELECT AVG(size_cm) FROM remaining_catches),
    (SELECT ARRAY_AGG(DISTINCT region) FROM remaining_catches WHERE region IS NOT NULL),
    (SELECT ARRAY_AGG(DISTINCT water_type) FROM remaining_catches WHERE water_type IS NOT NULL),
    (SELECT ARRAY_AGG(DISTINCT habitat_type) FROM remaining_catches WHERE habitat_type IS NOT NULL),
    (SELECT ARRAY_AGG(DISTINCT technique) FROM remaining_catches WHERE technique IS NOT NULL),
    (SELECT technique FROM remaining_catches WHERE technique IS NOT NULL GROUP BY technique ORDER BY COUNT(*) DESC, technique ASC LIMIT 1),
        (WITH seasons AS (SELECT CASE WHEN EXTRACT(month FROM caught_at) IN (12, 1, 2) THEN 'Winter' WHEN EXTRACT(month FROM caught_at) IN (3, 4, 5) THEN 'Spring' WHEN EXTRACT(month FROM caught_at) IN (6, 7, 8) THEN 'Summer' ELSE 'Autumn' END as season FROM remaining_catches WHERE caught_at IS NOT NULL) SELECT season FROM seasons GROUP BY season ORDER BY COUNT(*) DESC, season ASC LIMIT 1),
        (WITH times_of_day AS (SELECT CASE WHEN EXTRACT(hour FROM caught_at) >= 5 AND EXTRACT(hour FROM caught_at) < 12 THEN 'Morning' WHEN EXTRACT(hour FROM caught_at) >= 12 AND EXTRACT(hour FROM caught_at) < 17 THEN 'Afternoon' WHEN EXTRACT(hour FROM caught_at) >= 17 AND EXTRACT(hour FROM caught_at) < 21 THEN 'Evening' ELSE 'Night' END as time_of_day FROM remaining_catches WHERE caught_at IS NOT NULL) SELECT time_of_day FROM times_of_day GROUP BY time_of_day ORDER BY COUNT(*) DESC, time_of_day ASC LIMIT 1),

        NOW(),
        NOW()
FROM first_catch fc, biggest_catch bc
ON CONFLICT (user_id, species_id) DO UPDATE SET
    -- IMPORTANT: DO NOT update first_* fields. They are immutable after creation.
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

END;
