import requests
import csv
from tqdm import tqdm
import time

# Fichiers d'entrée et de sortie
INPUT_CSV_FILE = "poissons_mediterranee_deduplique.csv"
OUTPUT_CSV_FILE = "poissons_mediterranee_deduplicate_enrichi.csv"

# URL de l'API GBIF
GBIF_API_URL = "https://api.gbif.org/v1"

def list_to_postgres_array_string(py_list):
    """Formate une liste Python en une chaîne de tableau {a,b,c}."""
    if not py_list:
        return ''
    clean_items = [str(item).replace(',', ' ').replace('{', '').replace('}', '') for item in py_list]
    return "{" + ",".join(clean_items) + "}"

def get_gbif_data(scientific_name):
    """Interroge GBIF pour les données de base."""
    data = {'gbif_id': None, 'name_en': None, 'countries': []}
    try:
        match_params = {'name': scientific_name, 'rank': 'SPECIES'}
        response = requests.get(f"{GBIF_API_URL}/species/match", params=match_params, timeout=10)
        response.raise_for_status()
        match_data = response.json()

        if 'usageKey' not in match_data or not match_data.get('usageKey'):
            return data

        species_key = match_data.get('usageKey')
        data['gbif_id'] = species_key

        # Noms vernaculaires
        response_names = requests.get(f"{GBIF_API_URL}/species/{species_key}/vernacularNames", timeout=10)
        if response_names.ok:
            for name_info in response_names.json().get('results', []):
                if name_info.get('language') == 'eng' and 'vernacularName' in name_info:
                    data['name_en'] = name_info['vernacularName']
                    break

        # Pays
        response_dist = requests.get(f"{GBIF_API_URL}/species/{species_key}/distributions", timeout=10)
        if response_dist.ok:
            data['countries'] = sorted([dist.get('countryCode') for dist in response_dist.json().get('results', []) if 'countryCode' in dist])

    except Exception:
        # Échoue silencieusement pour ne pas bloquer tout le script
        pass
    return data

def main():
    """Script principal pour enrichir le CSV dédupliqué avec GBIF."""
    try:
        with open(INPUT_CSV_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            original_data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{INPUT_CSV_FILE}' n'a pas été trouvé.")
        return

    # S'assurer que les colonnes nécessaires existent
    if 'gbif_id' not in fieldnames: fieldnames.append('gbif_id')
    if 'name_en' not in fieldnames: fieldnames.append('name_en')

    enriched_data = []
    print(f"Enrichissement des données GBIF pour {len(original_data)} poissons...")

    for row in tqdm(original_data, desc="Progression"):
        time.sleep(0.1)

        # On enrichit seulement si l'ID n'est pas déjà là
        if not row.get('gbif_id'):
            gbif_data = get_gbif_data(row['scientific_name'])
            row.update(gbif_data)

        # Formatage de la liste des pays pour le CSV
        if 'countries' in row and isinstance(row['countries'], list):
            row['countries'] = list_to_postgres_array_string(row['countries'])

        enriched_data.append(row)

    print(f"Sauvegarde des données enrichies dans {OUTPUT_CSV_FILE}...")
    try:
        with open(OUTPUT_CSV_FILE, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(enriched_data)
        print(f"-> Succès ! Fichier {OUTPUT_CSV_FILE} créé.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")

if __name__ == "__main__":
    main()