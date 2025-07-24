// Types pour les données de pays
export interface CountryProperties {
  name: string;
  capital: string;
  continent: string;
  code: string;
}

export interface CountryGeometry {
  type: string;
  coordinates: number[][][];
}

export interface Country {
  _id: {
    $oid: string;
  };
  type: string;
  properties: CountryProperties;
  geometry: CountryGeometry;
}

export type CountriesData = Country[];

// Cache pour éviter de relire le fichier à chaque requête
let countriesCache: CountriesData | null = null;

export const getCountries = async (
  filter?: string[]
): Promise<CountriesData> => {
  try {
    // Utiliser le cache si disponible
    if (!countriesCache) {
      // Import dynamique du fichier JSON (équivalent de fs.readFileSync côté client)
      const countriesModule = await import("../../data/countries.json");
      countriesCache = countriesModule.default as CountriesData;
    }

    // Appliquer le filtre si nécessaire
    if (filter && filter.length > 0) {
      return (
        countriesCache?.filter(
          (country: Country) => !filter.includes(country.properties.continent)
        ) || []
      );
    }

    return countriesCache || [];
  } catch (error) {
    throw error;
  }
};
