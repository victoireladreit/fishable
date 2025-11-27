
declare
v_stats record;
begin
  -- Calculer toutes les stats depuis les captures
select
    count(*) as total,
    count(*) filter (where is_released) as released,
    count(*) filter (where not is_released) as kept,
    max(size_cm) as max_size,
    max(weight_kg) as max_weight,
    avg(size_cm) as avg_size,
    array_agg(distinct s.region) as regions,
    array_agg(distinct c.water_type) as water_types,
    array_agg(distinct c.habitat_type) as habitats,
    array_agg(distinct c.technique) as techniques
into v_stats
from catches c
         join fishing_sessions s on c.session_id = s.id
where s.user_id = p_user_id
  and c.species_id = p_species_id;

-- Mettre à jour le pokédex
update user_pokedex
set
    total_caught = v_stats.total,
    total_released = v_stats.released,
    total_kept = v_stats.kept,
    biggest_size_cm = v_stats.max_size,
    biggest_weight_kg = v_stats.max_weight,
    average_size_cm = v_stats.avg_size,
    regions_caught = v_stats.regions,
    water_types_caught = v_stats.water_types,
    habitat_types_caught = v_stats.habitats,
    techniques_used = v_stats.techniques,
    updated_at = now()
where user_id = p_user_id
  and species_id = p_species_id;
end;
