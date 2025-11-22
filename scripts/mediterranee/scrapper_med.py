import requests
import csv
from bs4 import BeautifulSoup
from tqdm import tqdm
import re
from urllib.parse import urljoin
import time

# URL de la page Wikipedia
BASE_URL = "https://fr.wikipedia.org"
LIST_URL = "https://fr.wikipedia.org/wiki/Liste_des_poissons_de_la_mer_M%C3%A9diterran%C3%A9e"

# Nom du fichier CSV qui sera généré
OUTPUT_CSV_FILE = "poissons_mediterranee.csv"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
}

def clean_text(text):
    """Nettoie le texte en retirant les références comme [1], [2], etc."""
    if not text:
        return ""
    return re.sub(r'\[\d+\]', '', text).strip()

def get_fish_list(url):
    """
    Scrape la page principale pour obtenir la liste des poissons depuis le tableau.
    """
    print(f"1/3 - Récupération de la liste des poissons depuis {url}...")
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Erreur lors de la récupération de la liste : {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')

    fish_list = []
    # --- CORRECTION MAJEURE : On cible le tableau principal ---
    table = soup.find('table', class_='wikitable sortable')
    if not table:
        print("Erreur : Impossible de trouver le tableau 'wikitable sortable' sur la page.")
        return []

    # On parcourt toutes les lignes du tableau, en sautant l'en-tête
    for row in table.find('tbody').find_all('tr')[1:]:
        cells = row.find_all('td')
        if len(cells) < 5: # S'assurer qu'on a assez de colonnes
            continue

        family = cells[1].get_text(strip=True)
        name = cells[2].get_text(strip=True)

        # Le nom scientifique et l'URL sont dans la 4ème colonne
        scientific_name_cell = cells[3]
        scientific_name_tag = scientific_name_cell.find('i')
        link_tag = scientific_name_cell.find('a')

        if scientific_name_tag and link_tag:
            scientific_name = scientific_name_tag.get_text(strip=True)
            details_url = urljoin(BASE_URL, link_tag['href'])

            # L'URL de l'image est dans la 5ème colonne
            photo_url = None
            image_tag = cells[4].find('img')
            if image_tag and 'src' in image_tag.attrs:
                photo_url = "https:" + image_tag['src']

            fish_list.append({
                'name': name,
                'scientific_name': scientific_name,
                'family': family,
                'photo_url': photo_url,
                'icon_url': photo_url, # On utilise la même pour l'icône
                'details_url': details_url
            })

    print(f"-> {len(fish_list)} poissons trouvés dans la liste.")
    return fish_list

def get_fish_description(fish_data):
    """
    Visite la page détaillée d'un poisson pour scraper uniquement la description.
    """
    if not fish_data.get('details_url'):
        return fish_data

    try:
        time.sleep(0.05) # Petite pause
        response = requests.get(fish_data['details_url'], headers=HEADERS, timeout=10)
        if response.status_code != 200:
            return fish_data

        soup = BeautifulSoup(response.content, 'html.parser')

        # Description
        parser_output = soup.find('div', class_='mw-parser-output')
        description = ""
        if parser_output:
            first_p = parser_output.find('p', recursive=False)
            if first_p:
                description = clean_text(first_p.get_text())
        fish_data['description'] = description

    except requests.RequestException:
        pass
    return fish_data

def save_to_csv(data, filename):
    """Sauvegarde la liste de dictionnaires dans un fichier CSV."""
    if not data:
        print("Aucune donnée à sauvegarder.")
        return

    print(f"3/3 - Écriture des données dans le fichier {filename}...")

    fieldnames = [
        'name', 'name_en', 'scientific_name', 'common_names', 'family', 'category',
        'habitat_types', 'water_types', 'depth_range_min', 'depth_range_max',
        'temperature_range_min', 'temperature_range_max', 'geographic_zones',
        'countries', 'fao_zones', 'average_size_cm', 'max_size_cm',
        'average_weight_kg', 'max_weight_kg', 'rarity', 'icon_url', 'photo_url',
        'description', 'fishbase_id', 'gbif_id'
    ]

    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(data)
        print(f"-> Succès ! Fichier {filename} créé avec {len(data)} lignes.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")

if __name__ == "__main__":
    initial_fish_list = get_fish_list(LIST_URL)

    if initial_fish_list:
        all_fish_details = []
        print("2/3 - Récupération des descriptions pour chaque poisson (cela peut prendre plusieurs minutes)...")

        for fish in tqdm(initial_fish_list, desc="Progression"):
            details = get_fish_description(fish)
            all_fish_details.append(details)

        save_to_csv(all_fish_details, OUTPUT_CSV_FILE)