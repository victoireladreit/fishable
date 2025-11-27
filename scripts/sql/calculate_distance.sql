
DECLARE
    R integer = 6371; -- Rayon de la Terre en kilomètres
    dLat float;
    dLon float;
    a float;
    c float;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    lat1 := radians(lat1);
    lat2 := radians(lat2);

    a := sin(dLat / 2) * sin(dLat / 2) +
         cos(lat1) * cos(lat2) *
         sin(dLon / 2) * sin(dLon / 2);
    c := 2 * atan2(sqrt(a), sqrt(1 - a));

    RETURN R * c;
END;
