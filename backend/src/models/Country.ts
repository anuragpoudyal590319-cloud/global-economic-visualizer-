import { db } from '../config/database';

export interface Country {
  id: number;
  iso_code: string;
  iso_code_3?: string;
  name: string;
  region?: string;
  created_at: string;
}

export const CountryModel = {
  getAll: (): Country[] => {
    const stmt = db.prepare('SELECT * FROM countries ORDER BY name');
    return stmt.all() as Country[];
  },

  getByIso: (isoCode: string): Country | undefined => {
    const stmt = db.prepare('SELECT * FROM countries WHERE iso_code = ?');
    return stmt.get(isoCode) as Country | undefined;
  },

  create: (country: Omit<Country, 'id' | 'created_at'>): Country => {
    const stmt = db.prepare(`
      INSERT INTO countries (iso_code, iso_code_3, name, region)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      country.iso_code,
      country.iso_code_3 || null,
      country.name,
      country.region || null
    );
    return CountryModel.getByIso(country.iso_code)!;
  },

  bulkCreate: (countries: Omit<Country, 'id' | 'created_at'>[]): void => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO countries (iso_code, iso_code_3, name, region)
      VALUES (?, ?, ?, ?)
    `);
    // Insert countries one by one (transaction handled internally)
    for (const country of countries) {
      try {
        stmt.run(
          country.iso_code,
          country.iso_code_3 || null,
          country.name,
          country.region || null
        );
      } catch (error) {
        // Ignore duplicate key errors (INSERT OR IGNORE behavior)
        if (!(error as Error).message.includes('UNIQUE')) {
          throw error;
        }
      }
    }
  },
};

