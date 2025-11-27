import requests
import csv
from tqdm import tqdm
import json

# Fichiers d'entrée et de sortie
INPUT_CSV_FILE = "poissons_france.csv"
OUTPUT_CSV_FILE = "poissons_france_enrichi.csv"

# URL de l'API GBIF
GBIF_API_URL = "https://api.gbif.org/v1"

def get_gbif_species_info(scientific_name):
    """
    Interroge l'API GBIF pour obtenir les informations sur une espèce.
    """
    # 1. Trouver la clé de l'espèce (usageKey)
    match_params = {'name': scientific_name, 'rank': 'SPECIES'}
    try:
        response = requests.get(f"{GBIF_API_URL}/species/match", params=match_params)
        response.raise_for_status()
        match_data = response.json()
    except (requests.RequestException, ValueError):
        return None, None, None, None

    if 'usageKey' not in match_data:
        return None, None, None, None

    species_key = match_data.get('usageKey')
    gbif_id = species_key

    # 2. Récupérer les détails de l'espèce
    habitats = []
    try:
        response = requests.get(f"{GBIF_API_URL}/species/{species_key}")
        response.raise_for_status()
        species_data = response.json()
        if 'habitats' in species_data and species_data['habitats']:
            habitats = [h.lower() for h in species_data['habitats']]
    except (requests.RequestException, ValueError):
        habitats = []

    # 3. Récupérer les noms vernaculaires (communs)
    english_name = None
    try:
        response = requests.get(f"{GBIF_API_URL}/species/{species_key}/vernacularNames")
        response.raise_for_status()
        vernacular_data = response.json().get('results', [])
        for name_info in vernacular_data:
            if name_info.get('language') == 'eng' and 'vernacularName' in name_info:
                english_name = name_info['vernacularName']
                break # On prend le premier nom anglais trouvé
    except (requests.RequestException, ValueError):
        english_name = None

    # 4. Récupérer la distribution (pays)
    countries = []
    try:
        response = requests.get(f"{GBIF_API_URL}/species/{species_key}/distributions")
        response.raise_for_status()
        distribution_data = response.json().get('results', [])
        countries = sorted([dist.get('countryCode') for dist in distribution_data if 'countryCode' in dist])
    except (requests  .RequestException, ValueError):
        countries = []

    return gbif_id, english_name, habitats, countries

def main():
    """
    Script principal pour lire le CSV, l'enrichir avec GBIF et sauvegarder le résultat.
    """
    print(f"Lecture du fichier d'entrée : {INPUT_CSV_FILE}")
    try:
        with open(INPUT_CSV_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{INPUT_CSV_FILE}' n'a pas été trouvé. Assurez-vous d'avoir d'abord lancé 'scraper.py'.")
        return

    print(f"Enrichissement des données avec l'API GBIF pour {len(data)} poissons...")

    enriched_data = []
    for row in tqdm(data, desc="Progression"):
        scientific_name = row.get('scientific_name')
        if not scientific_name:
            enriched_data.append(row)
            continue

        gbif_id, english_name, habitats, countries = get_gbif_species_info(scientific_name)

        # Mise à jour de la ligne avec les nouvelles données si elles sont trouvées
        if gbif_id:
            row['gbif_id'] = gbif_id
        if english_name:
            row['name_en'] = english_name

        # On sépare les habitats en 'water_types' et 'habitat_types'
        if habitats:
            water_types = []
            habitat_types = []
            for h in habitats:
                if h in ['freshwater', 'saltwater', 'brackish']:
                    water_types.append(h)
                else:
                    habitat_types.append(h)
            row['water_types'] = json.dumps(water_types)
            row['habitat_types'] = json.dumps(habitat_types)

        if countries:
            row['countries'] = json.dumps(countries)

        enriched_data.append(row)

    print(f"Sauvegarde des données enrichies dans {OUTPUT_CSV_FILE}...")
    try:
        with open(OUTPUT_CSV_FILE, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_data)
        print("-> Succès ! Le fichier enrichi a été créé.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")


if __name__ == "__main__":
    main()