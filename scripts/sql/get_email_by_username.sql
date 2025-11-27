
DECLARE
user_email TEXT;
  user_id UUID;
BEGIN
  -- Récupérer l'ID utilisateur depuis profiles
SELECT id INTO user_id
FROM public.profiles
WHERE username = username_input;

-- Si pas trouvé, retourner null
IF user_id IS NULL THEN
    RETURN NULL;
END IF;

  -- Récupérer l'email depuis auth.users
SELECT email INTO user_email
FROM auth.users
WHERE id = user_id;

RETURN user_email;
END;
