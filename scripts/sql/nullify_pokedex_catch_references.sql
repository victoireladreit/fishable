BEGIN
UPDATE user_pokedex
SET first_catch_id = NULL
WHERE first_catch_id = ANY(catch_ids);

UPDATE user_pokedex
SET biggest_catch_id = NULL
WHERE biggest_catch_id = ANY(catch_ids);
END;
