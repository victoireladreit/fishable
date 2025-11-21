import csv

# Le fichier à modifier
CSV_FILE = "poissons_france_enrichi.csv"

def main():
    """
    Met à jour les colonnes 'water_types' et 'countries' pour toutes les lignes.
    """
    print(f"Lecture du fichier : {CSV_FILE}...")
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{CSV_FILE}' n'a pas été trouvé.")
        return

    # S'assurer que les colonnes existent
    if 'water_types' not in fieldnames or 'countries' not in fieldnames:
        print("Erreur : Les colonnes 'water_types' et/ou 'countries' sont manquantes.")
        return

    print("Mise à jour des colonnes 'water_types' et 'countries'...")
    for row in data:
        # Assigner les valeurs formatées pour PostgreSQL
        row['water_types'] = '{"fresh"}'
        row['countries'] = '{"FR"}'

    print(f"Sauvegarde des modifications dans {CSV_FILE}...")
    try:
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"-> Succès ! {len(data)} lignes ont été mises à jour.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier : {e}")

if __name__ == "__main__":
    main()
