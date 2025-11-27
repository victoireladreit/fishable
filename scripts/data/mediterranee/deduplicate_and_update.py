import csv

# --- Fichiers de référence ---
FRESHWATER_FILE = "../eau-douce-france-metropole/poissons_france_enrichi.csv"
MED_FILE = "poissons_mediterranee_enrichi.csv"

# --- Fichiers de sortie ---
DEDUPLICATED_CSV_OUTPUT = "poissons_mediterranee_deduplique.csv"
SQL_UPDATE_OUTPUT = "update_existing_fish.sql"

# --- Données à ajouter ---
MEDITERRANEAN_COUNTRIES = [
    "AL", "DZ", "BA", "HR", "CY", "EG", "FR", "GR", "IL", "IT",
    "LB", "LY", "MT", "MC", "ME", "MA", "PS", "SI", "ES", "SY", "TN", "TR"
]

def main():
    """
    Sépare les poissons de Méditerranée en "nouveaux" et "doublons",
    et génère un CSV pour les nouveaux et un SQL pour les doublons.
    """
    # 1. Lire tous les noms scientifiques des poissons d'eau douce
    print(f"Lecture du fichier de référence : {FRESHWATER_FILE}")
    try:
        with open(FRESHWATER_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            freshwater_names = {row['scientific_name'] for row in reader}
        print(f"-> {len(freshwater_names)} poissons d'eau douce trouvés.")
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{FRESHWATER_FILE}' n'a pas été trouvé.")
        return

    # 2. Lire le fichier des poissons de Méditerranée et séparer les données
    print(f"Analyse du fichier des poissons de Méditerranée : {MED_FILE}")
    try:
        with open(MED_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            med_data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{MED_FILE}' n'a pas été trouvé.")
        return

    new_fish_rows = []
    duplicate_fish_names = []

    for row in med_data:
        if row['scientific_name'] in freshwater_names:
            duplicate_fish_names.append(row['scientific_name'])
        else:
            new_fish_rows.append(row)

    print(f"Analyse terminée : {len(new_fish_rows)} nouveaux poissons et {len(duplicate_fish_names)} doublons trouvés.")

    # 3. Écrire le nouveau fichier CSV dédupliqué
    if new_fish_rows:
        print(f"Génération du fichier CSV dédupliqué : {DEDUPLICATED_CSV_OUTPUT}")
        try:
            with open(DEDUPLICATED_CSV_OUTPUT, 'w', newline='', encoding='utf-8') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(new_fish_rows)
            print(f"-> Succès ! {len(new_fish_rows)} lignes écrites.")
        except IOError as e:
            print(f"Erreur lors de l'écriture du fichier CSV : {e}")
    else:
        print("Aucun nouveau poisson à ajouter dans le fichier CSV.")

    # 4. Générer le fichier SQL de mise à jour pour les doublons
    if duplicate_fish_names:
        print(f"Génération du script SQL de mise à jour : {SQL_UPDATE_OUTPUT}")

        # Formatte la liste des pays pour l'instruction ARRAY de SQL
        countries_sql_array = "ARRAY[" + ",".join([f"'{c}'" for c in MEDITERRANEAN_COUNTRIES]) + "]"

        try:
            with open(SQL_UPDATE_OUTPUT, 'w', encoding='utf-8') as outfile:
                outfile.write("-- Script pour mettre à jour les poissons existants avec les données de la Méditerranée\n\n")
                for name in duplicate_fish_names:
                    # Échapper les apostrophes dans le nom scientifique pour la requête SQL
                    safe_name = name.replace("'", "''")

                    # Commande pour ajouter 'salt' au tableau water_types
                    update_water_types = f"UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{{salt}}')) WHERE scientific_name = '{safe_name}';"

                    # Commande pour ajouter les pays méditerranéens
                    update_countries = f"UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || {countries_sql_array})) WHERE scientific_name = '{safe_name}';"

                    outfile.write(f"-- Mise à jour pour : {name}\n")
                    outfile.write(update_water_types + "\n")
                    outfile.write(update_countries + "\n\n")
            print(f"-> Succès ! {len(duplicate_fish_names)} poissons à mettre à jour dans le fichier SQL.")
        except IOError as e:
            print(f"Erreur lors de l'écriture du fichier SQL : {e}")
    else:
        print("Aucun doublon trouvé, pas de script SQL généré.")

if __name__ == "__main__":
    main()