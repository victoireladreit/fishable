import csv

# --- Fichiers de référence (ceux déjà dans votre DB) ---
FRESHWATER_FILE = "scripts/eau-douce-france-metropole/poissons_france_enrichi.csv"
MED_FILE = "scripts/mediterranee/poissons_mediterranee_deduplicate_enrichi.csv"

# --- Fichier d'entrée pour l'Atlantique ---
ATLANTIC_INPUT_FILE = "scripts/atlantique/poissons_atlantique.csv"

# --- Fichiers de sortie ---
ATLANTIC_OUTPUT_CSV = "scripts/atlantique/poissons_atlantique_deduplique_enrichi.csv"
SQL_UPDATE_OUTPUT = "scripts/atlantique/update_atlantic_duplicates.sql"

# --- Données à ajouter ---
# Liste non exhaustive mais représentative des pays bordant l'Atlantique
ATLANTIC_COUNTRIES = [
    "US", "CA", "MX", "BR", "AR", "PT", "ES", "FR", "IE", "GB", "IS", "NO",
    "MA", "SN", "NG", "ZA", "GH", "CI", "LR", "SL", "GN", "GW", "GM", "EH",
    "MR", "CV", "GL", "SR", "GY", "VE", "CO", "PA", "CR", "NI", "HN", "GT",
    "BZ", "BS", "HT", "DO", "JM", "CU"
]

def list_to_postgres_array_string(py_list):
    """Formate une liste Python en une chaîne de tableau {a,b,c}."""
    if not py_list:
        return ''
    clean_items = [str(item).replace(',', ' ').replace('{', '').replace('}', '') for item in py_list]
    return "{" + ",".join(clean_items) + "}"

def main():
    """
    Sépare les poissons de l'Atlantique, génère un CSV pour les nouveaux et un SQL pour les doublons.
    """
    # 1. Lire tous les noms scientifiques des poissons déjà existants
    existing_scientific_names = set()
    try:
        print(f"Lecture du fichier de référence : {FRESHWATER_FILE}")
        with open(FRESHWATER_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            for row in reader:
                existing_scientific_names.add(row['scientific_name'])

        print(f"Lecture du fichier de référence : {MED_FILE}")
        with open(MED_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            for row in reader:
                existing_scientific_names.add(row['scientific_name'])

        print(f"-> {len(existing_scientific_names)} poissons uniques trouvés dans les fichiers existants.")
    except FileNotFoundError as e:
        print(f"Erreur : Un fichier de référence est manquant. {e}")
        return

    # 2. Lire le fichier Atlantique et séparer les nouveaux des doublons
    print(f"Analyse du fichier des poissons de l'Atlantique : {ATLANTIC_INPUT_FILE}")
    try:
        with open(ATLANTIC_INPUT_FILE, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            atlantic_data = list(reader)
            fieldnames = reader.fieldnames
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{ATLANTIC_INPUT_FILE}' n'a pas été trouvé.")
        return

    new_fish_rows = []
    duplicate_fish_names = []

    for row in atlantic_data:
        if row['scientific_name'] in existing_scientific_names:
            duplicate_fish_names.append(row['scientific_name'])
        else:
            # C'est un nouveau poisson, on l'enrichit et on l'ajoute à la liste
            row['water_types'] = '{"salt"}'
            row['countries'] = list_to_postgres_array_string(ATLANTIC_COUNTRIES)
            new_fish_rows.append(row)
            # On l'ajoute aussi aux noms existants pour gérer les doublons internes au fichier Atlantique
            existing_scientific_names.add(row['scientific_name'])

    print(f"Analyse terminée : {len(new_fish_rows)} nouveaux poissons et {len(duplicate_fish_names)} doublons trouvés.")

    # 3. Écrire le nouveau fichier CSV dédupliqué et enrichi
    if new_fish_rows:
        print(f"Génération du fichier CSV dédupliqué : {ATLANTIC_OUTPUT_CSV}")
        try:
            with open(ATLANTIC_OUTPUT_CSV, 'w', newline='', encoding='utf-8') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(new_fish_rows)
            print(f"-> Succès ! {len(new_fish_rows)} lignes écrites.")
        except IOError as e:
            print(f"Erreur lors de l'écriture du fichier CSV : {e}")

    # 4. Générer le fichier SQL de mise à jour pour les doublons
    if duplicate_fish_names:
        print(f"Génération du script SQL de mise à jour : {SQL_UPDATE_OUTPUT}")
        countries_sql_array = "ARRAY[" + ",".join([f"'{c}'" for c in ATLANTIC_COUNTRIES]) + "]"

        try:
            with open(SQL_UPDATE_OUTPUT, 'w', encoding='utf-8') as outfile:
                outfile.write("-- Script pour mettre à jour les poissons existants avec les données de l'Atlantique\n\n")
                for name in duplicate_fish_names:
                    safe_name = name.replace("'", "''")

                    update_water_types = f"UPDATE public.species_registry SET water_types = ARRAY(SELECT DISTINCT unnest(water_types || '{{salt}}')) WHERE scientific_name = '{safe_name}';"
                    update_countries = f"UPDATE public.species_registry SET countries = ARRAY(SELECT DISTINCT unnest(countries || {countries_sql_array})) WHERE scientific_name = '{safe_name}';"

                    outfile.write(f"-- Mise à jour pour : {name}\n")
                    outfile.write(update_water_types + "\n")
                    outfile.write(update_countries + "\n\n")
            print(f"-> Succès ! {len(duplicate_fish_names)} poissons à mettre à jour dans le fichier SQL.")
        except IOError as e:
            print(f"Erreur lors de l'écriture du fichier SQL : {e}")

if __name__ == "__main__":
    main()