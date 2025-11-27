
DECLARE
total_distance float := 0;
    i integer;
    p1 jsonb;
    p2 jsonb;
BEGIN
    -- Vérifie si le parcours est un tableau valide avec au moins 2 points
    IF route IS NULL OR jsonb_typeof(route) != 'array' OR jsonb_array_length(route) < 2 THEN
        RETURN 0;
END IF;

FOR i IN 0..jsonb_array_length(route) - 2 LOOP
        p1 := route -> i;
        p2 := route -> (i + 1);

        -- S'assure que les points contiennent bien latitude et longitude
        IF (p1->>'latitude') IS NOT NULL AND (p1->>'longitude') IS NOT NULL AND
           (p2->>'latitude') IS NOT NULL AND (p2->>'longitude') IS NOT NULL THEN

            total_distance := total_distance + public.calculate_distance(
                (p1->>'latitude')::float,
                (p1->>'longitude')::float,
                (p2->>'latitude')::float,
                (p2->>'longitude')::float
            );
END IF;
END LOOP;

RETURN total_distance;
END;
