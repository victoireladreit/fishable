import requests
import csv
from bs4 import BeautifulSoup
from tqdm import tqdm

# L'URL de la page Wikipedia à scraper
WIKI_URL = "https://fr.wikipedia.org/wiki/Cat%C3%A9gorie:Poisson_d%27eau_saum%C3%A2tre"

# Le fichier CSV à modifier
CSV_FILE = "poissons_france_enrichi.csv"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
}

def get_brackish_fish_names(url):
    """
    Scrape la page de catégorie Wikipedia pour obtenir une liste des noms de poissons.
    Retourne un set pour une recherche rapide.
    """
    print(f"Récupération de la liste des poissons d'eau saumâtre depuis {url}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Les noms des poissons sont dans des balises <li><a> dans la div #mw-pages
        fish_links = soup.select('div#mw-pages li a')

        if not fish_links:
            print("Avertissement : Impossible de trouver la liste des poissons sur la page Wikipedia.")
            return set()

        fish_names = {link.get_text(strip=True) for link in fish_links}
        print(f"-> {len(fish_names)} poissons trouvés dans la catégorie 'eau saumâtre'.")
        return fish_names

    except requests.RequestException as e:
        print(f"Erreur réseau lors de la récupération de la page Wikipedia : {e}")
        return None

def main():
    """
    Script principal pour mettre à jour le type d'eau des poissons.
    """
    brackish_names = get_brackish_fish_names(WIKI_URL)
    if brackish_names is None:
        print("Arrêt du script en raison d'une erreur réseau.")
        return

    print(f"Lecture du fichier CSV : {CSV_FILE}...")
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{CSV_FILE}' n'a pas été trouvé.")
        return

    if 'water_types' not in fieldnames:
        print("Erreur : La colonne 'water_types' est manquante dans le CSV.")
        return

    updated_count = 0
    print("Mise à jour des données...")
    for row in data:
        # On vérifie si le nom commun du poisson est dans la liste scrapée
        if row['name'] in brackish_names:
            # On met à jour la colonne pour inclure "fresh" et "brackish"
            # C'est le format attendu par PostgreSQL pour un tableau de texte
            row['water_types'] = '{"fresh","brackish"}'
            updated_count += 1

    if updated_count > 0:
        print(f"{updated_count} poissons ont été identifiés comme étant aussi d'eau saumâtre.")
        print(f"Sauvegarde des modifications dans {CSV_FILE}...")
        try:
            with open(CSV_FILE, 'w', newline='', encoding='utf-8') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            print("-> Succès ! Le fichier a été mis à jour.")
        except IOError as e:
            print(f"Erreur lors de l'écriture du fichier : {e}")
    else:
        print("Aucun poisson correspondant n'a été trouvé dans le CSV. Aucune modification n'a été apportée.")

if __name__ == "__main__":
    main()