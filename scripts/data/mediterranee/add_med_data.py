import csv

# Fichiers d'entrée et de sortie
INPUT_CSV_FILE = "poissons_mediterranee.csv"
OUTPUT_CSV_FILE = "poissons_mediterranee_enrichi.csv"

# Liste des pays avec un littoral sur la mer Méditerranée (codes ISO)
MEDITERRANEAN_COUNTRIES = [
    "AL", "DZ", "BA", "HR", "CY", "EG", "FR", "GR", "IL", "IT",
    "LB", "LY", "MT", "MC", "ME", "MA", "PS", "SI", "ES", "SY", "TN", "TR"
]

def list_to_postgres_array_string(py_list):
    """Formate une liste Python en une chaîne de tableau {a,b,c}."""
    if not py_list:
        return ''
    # Format simple car les codes pays n'ont pas de caractères spéciaux
    return "{" + ",".join(py_list) + "}"

def main():
    """
    Ajoute les types d'eau et les pays méditerranéens au fichier CSV.
    """
    print(f"Lecture du fichier : {INPUT_CSV_FILE}...")
    try:
        with open(INPUT_CSV_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{INPUT_CSV_FILE}' n'a pas été trouvé.")
        return

    # S'assurer que les colonnes existent, sinon les ajouter
    if 'water_types' not in fieldnames:
        fieldnames.append('water_types')
    if 'countries' not in fieldnames:
        fieldnames.append('countries')

    print("Mise à jour des colonnes 'water_types' et 'countries'...")

    # Préparer les valeurs à ajouter
    water_types_value = '{"salt"}'
    countries_value = list_to_postgres_array_string(MEDITERRANEAN_COUNTRIES)

    for row in data:
        row['water_types'] = water_types_value
        row['countries'] = countries_value

    print(f"Sauvegarde des données enrichies dans {OUTPUT_CSV_FILE}...")
    try:
        with open(OUTPUT_CSV_FILE, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(data)
        print(f"-> Succès ! Fichier {OUTPUT_CSV_FILE} créé avec {len(data)} lignes mises à jour.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier : {e}")

if __name__ == "__main__":
    main()