import requests
import csv
from bs4 import BeautifulSoup
from tqdm import tqdm
import re
from urllib.parse import urljoin

# URL de la page Wikipedia contenant la liste des poissons
BASE_URL = "https://fr.wikipedia.org"
LIST_URL = f"{BASE_URL}/wiki/Liste_des_poissons_d%27eau_douce_en_France_m%C3%A9tropolitaine"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
}

# Nom du fichier CSV qui sera généré
OUTPUT_CSV_FILE = "poissons_france.csv"

def clean_text(text):
    """Nettoie le texte en retirant les références comme [1], [2], etc."""
    if not text:
        return ""
    return re.sub(r'\[\d+\]', '', text).strip()

def get_fish_list(url):
    """
    Scrape la page principale pour obtenir la liste des poissons avec le nom,
    le nom scientifique, la famille et l'URL de leur page détaillée.
    """
    print("1/3 - Récupération de la liste des poissons...")
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Erreur lors de la récupération de la liste : {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')

    # --- CORRECTION MAJEURE : On cherche toutes les sections de famille ---
    # On trouve tous les titres h4, qui correspondent aux familles
    family_headers = soup.find_all('h4')

    fish_list = []

    for header in family_headers:
        header_text = header.get_text(strip=True)
        if 'Famille' not in header_text:
            continue

        family = ""
        if ':' in header_text:
            family = header_text.split(':')[1].strip()

        # Le tableau est le prochain élément 'table' qui suit le titre h4
        table = header.find_next('table', class_='wikitable')
        if not table:
            continue

        for row in table.find('tbody').find_all('tr')[1:]:  # [1:] pour sauter l'en-tête
            cells = row.find_all('td')
            if len(cells) < 1:
                continue

            cell_one = cells[0]

            # Nom vernaculaire (le premier texte trouvé directement dans la cellule)
            vernacular_name = cell_one.find(string=True, recursive=False)
            if vernacular_name:
                vernacular_name = vernacular_name.strip()
            else:
                vernacular_name = ""

            # Nom scientifique (dans la balise <i>)
            scientific_name_tag = cell_one.find('i')
            if not scientific_name_tag:
                continue
            scientific_name = scientific_name_tag.get_text(strip=True)

            # URL de la page de détails (le premier lien dans la cellule)
            link_tag = cell_one.find('a')
            details_url = None
            if link_tag and 'href' in link_tag.attrs:
                details_url = urljoin(BASE_URL, link_tag['href'])

            fish_list.append({
                'name': vernacular_name,
                'scientific_name': scientific_name,
                'family': family,
                'details_url': details_url
            })

    if not fish_list:
        print("Erreur: Aucune liste de poissons n'a pu être extraite. La structure de la page a peut-être changé.")
        return []

    print(f"-> {len(fish_list)} poissons trouvés dans la liste.")
    return fish_list


def get_fish_details(fish_data):
    """
    Visite la page détaillée d'un poisson pour scraper la description,
    l'URL de l'image et d'autres informations de l'infobox.
    """
    if not fish_data.get('details_url'):
        return fish_data

    try:
        response = requests.get(fish_data['details_url'], headers=HEADERS)
        response.raise_for_status()
    except requests.RequestException:
        return fish_data

    soup = BeautifulSoup(response.content, 'html.parser')

    content_div = soup.find('div', id='mw-content-text')
    description = ""
    if content_div:
        first_p = content_div.find('p', recursive=False, string=lambda s: s and s.strip())
        if first_p:
            description = clean_text(first_p.get_text())

    fish_data['description'] = description

    infobox = soup.find('table', class_='infobox_v2')
    fish_data['photo_url'] = ''
    fish_data['max_size_cm'] = ''
    fish_data['max_weight_kg'] = ''

    if infobox:
        image_tag = infobox.find('img')
        if image_tag and 'src' in image_tag.attrs:
            fish_data['photo_url'] = f"https:{image_tag['src']}"

        for row in infobox.find_all('tr'):
            header = row.find('th')
            if header:
                header_text = header.get_text(strip=True).lower()
                value_cell = row.find('td')
                if value_cell:
                    value_text = clean_text(value_cell.get_text())
                    if 'taille' in header_text:
                        match = re.search(r'(\d+[\.,]?\d*)', value_text)
                        if match:
                            fish_data['max_size_cm'] = match.group(1).replace(',', '.')
                    if 'poids' in header_text or 'masse' in header_text:
                        match = re.search(r'(\d+[\.,]?\d*)', value_text)
                        if match:
                            fish_data['max_weight_kg'] = match.group(1).replace(',', '.')

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

    processed_data = []
    for row in data:
        new_row = {key: row.get(key, '') for key in fieldnames}
        processed_data.append(new_row)

    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(processed_data)
        print(f"-> Succès ! Fichier {filename} créé avec {len(data)} lignes.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")

if __name__ == "__main__":
    initial_fish_list = get_fish_list(LIST_URL)

    if initial_fish_list:
        all_fish_details = []
        print("2/3 - Récupération des détails pour chaque poisson (cela peut prendre plusieurs minutes)...")

        for fish in tqdm(initial_fish_list, desc="Progression"):
            details = get_fish_details(fish)
            all_fish_details.append(details)

        save_to_csv(all_fish_details, OUTPUT_CSV_FILE)