-- Script pour mettre à jour les poissons existants avec les données de la Méditerranée

-- Mise à jour pour : Anguilla anguilla
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Anguilla anguilla';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Anguilla anguilla';

-- Mise à jour pour : Atherina boyeri
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Atherina boyeri';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Atherina boyeri';

-- Mise à jour pour : Alosa fallax
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Alosa fallax';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Alosa fallax';

-- Mise à jour pour : Pomatoschistus microps
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pomatoschistus microps';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Pomatoschistus microps';

-- Mise à jour pour : Dicentrarchus labrax
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dicentrarchus labrax';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Dicentrarchus labrax';

-- Mise à jour pour : Chelon auratus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelon auratus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Chelon auratus';

-- Mise à jour pour : Mugil cephalus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mugil cephalus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Mugil cephalus';

-- Mise à jour pour : Chelon ramada
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelon ramada';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Chelon ramada';

-- Mise à jour pour : Chelon saliens
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelon saliens';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Chelon saliens';

-- Mise à jour pour : Chelon labrosus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelon labrosus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Chelon labrosus';

-- Mise à jour pour : Platichthys flesus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Platichthys flesus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['AL','DZ','BA','HR','CY','EG','FR','GR','IL','IT','LB','LY','MT','MC','ME','MA','PS','SI','ES','SY','TN','TR'])) WHERE scientific_name = 'Platichthys flesus';

