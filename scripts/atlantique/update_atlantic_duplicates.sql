-- Script pour mettre à jour les poissons existants avec les données de l'Atlantique

-- Mise à jour pour : Anguilla anguilla
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Anguilla anguilla';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Anguilla anguilla';

-- Mise à jour pour : Conger conger
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Conger conger';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Conger conger';

-- Mise à jour pour : Atherina presbyter
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Atherina presbyter';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Atherina presbyter';

-- Mise à jour pour : Belone belone
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Belone belone';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Belone belone';

-- Mise à jour pour : Sardina pilchardus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Sardina pilchardus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Sardina pilchardus';

-- Mise à jour pour : Alosa fallax
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Alosa fallax';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Alosa fallax';

-- Mise à jour pour : Trisopterus minutus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trisopterus minutus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trisopterus minutus';

-- Mise à jour pour : Trisopterus luscus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trisopterus luscus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trisopterus luscus';

-- Mise à jour pour : Gaidropsarus mediterraneus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Gaidropsarus mediterraneus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Gaidropsarus mediterraneus';

-- Mise à jour pour : Merluccius merluccius
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Merluccius merluccius';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Merluccius merluccius';

-- Mise à jour pour : Lophius piscatorius
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Lophius piscatorius';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Lophius piscatorius';

-- Mise à jour pour : Osmerus eperlanus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Osmerus eperlanus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Osmerus eperlanus';

-- Mise à jour pour : Coryphoblennius galerita
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Coryphoblennius galerita';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Coryphoblennius galerita';

-- Mise à jour pour : Parablennius gattorugine
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Parablennius gattorugine';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Parablennius gattorugine';

-- Mise à jour pour : Blennius ocellaris
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Blennius ocellaris';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Blennius ocellaris';

-- Mise à jour pour : Parablennius sanguinolentus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Parablennius sanguinolentus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Parablennius sanguinolentus';

-- Mise à jour pour : Callionymus lyra
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Callionymus lyra';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Callionymus lyra';

-- Mise à jour pour : Trachinotus ovatus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trachinotus ovatus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trachinotus ovatus';

-- Mise à jour pour : Trachurus trachurus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trachurus trachurus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trachurus trachurus';

-- Mise à jour pour : Naucrates ductor
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Naucrates ductor';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Naucrates ductor';

-- Mise à jour pour : Lepadogaster candolii
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Lepadogaster candolii';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Lepadogaster candolii';

-- Mise à jour pour : Gobius cobitis
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Gobius cobitis';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Gobius cobitis';

-- Mise à jour pour : Thorogobius ephippiatus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Thorogobius ephippiatus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Thorogobius ephippiatus';

-- Mise à jour pour : Gobius niger
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Gobius niger';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Gobius niger';

-- Mise à jour pour : Gobius paganellus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Gobius paganellus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Gobius paganellus';

-- Mise à jour pour : Pomatoschistus microps
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pomatoschistus microps';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pomatoschistus microps';

-- Mise à jour pour : Symphodus melops
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Symphodus melops';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Symphodus melops';

-- Mise à jour pour : Ctenolabrus rupestris
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Ctenolabrus rupestris';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Ctenolabrus rupestris';

-- Mise à jour pour : Dicentrarchus labrax
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dicentrarchus labrax';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dicentrarchus labrax';

-- Mise à jour pour : Dicentrarchus punctatus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dicentrarchus punctatus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dicentrarchus punctatus';

-- Mise à jour pour : Mugil cephalus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mugil cephalus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mugil cephalus';

-- Mise à jour pour : Chelon labrosus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelon labrosus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Chelon labrosus';

-- Mise à jour pour : Mullus surmuletus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mullus surmuletus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mullus surmuletus';

-- Mise à jour pour : Mullus barbatus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mullus barbatus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mullus barbatus';

-- Mise à jour pour : Polyprion americanus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Polyprion americanus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Polyprion americanus';

-- Mise à jour pour : Sciaena umbra
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Sciaena umbra';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Sciaena umbra';

-- Mise à jour pour : Sarda sarda
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Sarda sarda';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Sarda sarda';

-- Mise à jour pour : Scomber scombrus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scomber scombrus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scomber scombrus';

-- Mise à jour pour : Scomber japonicus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scomber japonicus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scomber japonicus';

-- Mise à jour pour : Thunnus alalunga
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Thunnus alalunga';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Thunnus alalunga';

-- Mise à jour pour : Thunnus thynnus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Thunnus thynnus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Thunnus thynnus';

-- Mise à jour pour : Sparus aurata
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Sparus aurata';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Sparus aurata';

-- Mise à jour pour : Spondyliosoma cantharus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Spondyliosoma cantharus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Spondyliosoma cantharus';

-- Mise à jour pour : Diplodus sargus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Diplodus sargus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Diplodus sargus';

-- Mise à jour pour : Diplodus puntazzo
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Diplodus puntazzo';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Diplodus puntazzo';

-- Mise à jour pour : Diplodus cervinus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Diplodus cervinus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Diplodus cervinus';

-- Mise à jour pour : Diplodus vulgaris
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Diplodus vulgaris';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Diplodus vulgaris';

-- Mise à jour pour : Diplodus annularis
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Diplodus annularis';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Diplodus annularis';

-- Mise à jour pour : Boops boops
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Boops boops';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Boops boops';

-- Mise à jour pour : Oblada melanura
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Oblada melanura';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Oblada melanura';

-- Mise à jour pour : Lithognathus mormyrus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Lithognathus mormyrus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Lithognathus mormyrus';

-- Mise à jour pour : Pagellus acarne
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pagellus acarne';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pagellus acarne';

-- Mise à jour pour : Pagellus erythrinus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pagellus erythrinus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pagellus erythrinus';

-- Mise à jour pour : Pagellus bogaraveo
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pagellus bogaraveo';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pagellus bogaraveo';

-- Mise à jour pour : Dentex dentex
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dentex dentex';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dentex dentex';

-- Mise à jour pour : Pagrus pagrus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pagrus pagrus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pagrus pagrus';

-- Mise à jour pour : Trachinus draco
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trachinus draco';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trachinus draco';

-- Mise à jour pour : Echiichthys vipera
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Echiichthys vipera';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Echiichthys vipera';

-- Mise à jour pour : Trachinus araneus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trachinus araneus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trachinus araneus';

-- Mise à jour pour : Pleuronectes platessa
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pleuronectes platessa';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pleuronectes platessa';

-- Mise à jour pour : Platichthys flesus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Platichthys flesus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Platichthys flesus';

-- Mise à jour pour : Psetta maxima
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Psetta maxima';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Psetta maxima';

-- Mise à jour pour : Scophthalmus rhombus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scophthalmus rhombus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scophthalmus rhombus';

-- Mise à jour pour : Solea solea
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Solea solea';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Solea solea';

-- Mise à jour pour : Pegusa lascaris
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Pegusa lascaris';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Pegusa lascaris';

-- Mise à jour pour : Buglossidium luteum
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Buglossidium luteum';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Buglossidium luteum';

-- Mise à jour pour : Microchirus variegatus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Microchirus variegatus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Microchirus variegatus';

-- Mise à jour pour : Dactylopterus volitans
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dactylopterus volitans';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dactylopterus volitans';

-- Mise à jour pour : Scorpaena porcus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scorpaena porcus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scorpaena porcus';

-- Mise à jour pour : Eutrigla gurnardus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Eutrigla gurnardus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Eutrigla gurnardus';

-- Mise à jour pour : Trigla lyra
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Trigla lyra';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Trigla lyra';

-- Mise à jour pour : Chelidonichthys lucernus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Chelidonichthys lucernus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Chelidonichthys lucernus';

-- Mise à jour pour : Aspitrigla cuculus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Aspitrigla cuculus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Aspitrigla cuculus';

-- Mise à jour pour : Nerophis ophidion
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Nerophis ophidion';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Nerophis ophidion';

-- Mise à jour pour : Syngnathus typhle
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Syngnathus typhle';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Syngnathus typhle';

-- Mise à jour pour : Syngnathus acus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Syngnathus acus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Syngnathus acus';

-- Mise à jour pour : Balistes capriscus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Balistes capriscus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Balistes capriscus';

-- Mise à jour pour : Mola mola
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mola mola';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mola mola';

-- Mise à jour pour : Zeus faber
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Zeus faber';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Zeus faber';

-- Mise à jour pour : Scyliorhinus stellaris
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scyliorhinus stellaris';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scyliorhinus stellaris';

-- Mise à jour pour : Scyliorhinus canicula
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Scyliorhinus canicula';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Scyliorhinus canicula';

-- Mise à jour pour : Sphyrna zygaena
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Sphyrna zygaena';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Sphyrna zygaena';

-- Mise à jour pour : Mustelus mustelus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mustelus mustelus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mustelus mustelus';

-- Mise à jour pour : Mustelus asterias
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Mustelus asterias';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Mustelus asterias';

-- Mise à jour pour : Alopias superciliosus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Alopias superciliosus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Alopias superciliosus';

-- Mise à jour pour : Alopias vulpinus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Alopias vulpinus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Alopias vulpinus';

-- Mise à jour pour : Cetorhinus maximus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Cetorhinus maximus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Cetorhinus maximus';

-- Mise à jour pour : Carcharodon carcharias
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Carcharodon carcharias';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Carcharodon carcharias';

-- Mise à jour pour : Isurus oxyrinchus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Isurus oxyrinchus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Isurus oxyrinchus';

-- Mise à jour pour : Lamna nasus
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Lamna nasus';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Lamna nasus';

-- Mise à jour pour : Odontaspis ferox
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Odontaspis ferox';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Odontaspis ferox';

-- Mise à jour pour : Dasyatis pastinaca
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dasyatis pastinaca';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dasyatis pastinaca';

-- Mise à jour pour : Dipturus batis
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Dipturus batis';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Dipturus batis';

-- Mise à jour pour : Raja clavata
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Raja clavata';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Raja clavata';

-- Mise à jour pour : Torpedo marmorata
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Torpedo marmorata';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Torpedo marmorata';

-- Mise à jour pour : Torpedo nobiliana
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Torpedo nobiliana';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Torpedo nobiliana';

-- Mise à jour pour : Torpedo torpedo
UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{salt}')) WHERE scientific_name = 'Torpedo torpedo';
UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || ARRAY['US','CA','MX','BR','AR','PT','ES','FR','IE','GB','IS','NO','MA','SN','NG','ZA','GH','CI','LR','SL','GN','GW','GM','EH','MR','CV','GL','SR','GY','VE','CO','PA','CR','NI','HN','GT','BZ','BS','HT','DO','JM','CU'])) WHERE scientific_name = 'Torpedo torpedo';

