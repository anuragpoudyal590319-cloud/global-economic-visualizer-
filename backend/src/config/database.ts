import path from 'path';
import fs from 'fs';

// Simple file-based JSON database
// This avoids native compilation issues with better-sqlite3 on Node 24

interface DatabaseData {
  countries: Array<{
    id: number;
    iso_code: string;
    iso_code_3?: string;
    name: string;
    region?: string;
    created_at: string;
  }>;
  interest_rates: Array<{
    id: number;
    country_iso: string;
    rate: number;
    source?: string;
    effective_date?: string;
    updated_at: string;
  }>;
  inflation_rates: Array<{
    id: number;
    country_iso: string;
    rate: number;
    period: string;
    source?: string;
    effective_date?: string;
    updated_at: string;
  }>;
  exchange_rates: Array<{
    id: number;
    country_iso: string;
    currency_code: string;
    rate_to_usd: number;
    source?: string;
    effective_date?: string;
    updated_at: string;
  }>;
}

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/economic_data.json');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize empty database
const emptyDb: DatabaseData = {
  countries: [],
  interest_rates: [],
  inflation_rates: [],
  exchange_rates: [],
};

// Load database from file
function loadDb(): DatabaseData {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error loading database, creating new one:', error);
      return JSON.parse(JSON.stringify(emptyDb));
    }
  }
  return JSON.parse(JSON.stringify(emptyDb));
}

// Save database to file
function saveDb(data: DatabaseData): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Database interface similar to better-sqlite3
class SimpleDatabase {
  private _data: DatabaseData;

  constructor() {
    this._data = loadDb();
  }

  get data(): DatabaseData {
    return this._data;
  }

  prepare(sql: string) {
    return new Statement(sql, this._data, () => saveDb(this._data));
  }

  exec(sql: string): void {
    // Schema creation is handled in initializeDatabase
    // This is mostly a no-op for JSON database
  }

  transaction(fn: (data: DatabaseData) => void): void {
    fn(this._data);
    saveDb(this._data);
  }
}

class Statement {
  private sql: string;
  private data: DatabaseData;
  private save: () => void;

  constructor(sql: string, data: DatabaseData, save: () => void) {
    this.sql = sql;
    this.data = data;
    this.save = save;
  }

  all(...params: any[]): any[] {
    return this.runQuery(false, ...params);
  }

  get(...params: any[]): any {
    const results = this.runQuery(false, ...params);
    return results[0] || undefined;
  }

  run(...params: any[]): { lastInsertRowid: number; changes: number } {
    const results = this.runQuery(true, ...params);
    this.save();
    return {
      lastInsertRowid: results.length > 0 ? (results[0]?.id || 0) : 0,
      changes: results.length,
    };
  }

  private runQuery(isWrite: boolean, ...params: any[]): any[] {
    const sql = this.sql.trim().toUpperCase();
    const data = this.data;

    // SELECT queries
    if (sql.startsWith('SELECT')) {
      if (sql.includes('FROM COUNTRIES')) {
        let results = [...data.countries];
        
        if (sql.includes('WHERE ISO_CODE =')) {
          results = results.filter((r: any) => r.iso_code === params[0]);
        }
        
        if (sql.includes('ORDER BY NAME')) {
          results.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
        
        return results;
      }
      
      if (sql.includes('FROM INTEREST_RATES')) {
        return data.interest_rates.map((rate: any) => {
          const country = data.countries.find((c: any) => c.iso_code === rate.country_iso);
          return {
            ...rate,
            country_name: country?.name,
          };
        }).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
      
      if (sql.includes('FROM INFLATION_RATES')) {
        return data.inflation_rates.map((rate: any) => {
          const country = data.countries.find((c: any) => c.iso_code === rate.country_iso);
          return {
            ...rate,
            country_name: country?.name,
          };
        }).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
      
      if (sql.includes('FROM EXCHANGE_RATES')) {
        return data.exchange_rates.map((rate: any) => {
          const country = data.countries.find((c: any) => c.iso_code === rate.country_iso);
          return {
            ...rate,
            country_name: country?.name,
          };
        }).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
    }

    // INSERT queries
    if (sql.startsWith('INSERT')) {
      const ignoreConflict = sql.includes('INSERT OR IGNORE');
      
      if (sql.includes('INTO COUNTRIES')) {
        const existing = data.countries.find((c: any) => c.iso_code === params[0]);
        if (existing && ignoreConflict) {
          return [];
        }
        if (existing && !ignoreConflict) {
          throw new Error('UNIQUE constraint failed');
        }
        
        const id = data.countries.length > 0 
          ? Math.max(...data.countries.map((c: any) => c.id || 0)) + 1 
          : 1;
        const country = {
          id,
          iso_code: params[0],
          iso_code_3: params[1] || null,
          name: params[2],
          region: params[3] || null,
          created_at: new Date().toISOString(),
        };
        data.countries.push(country);
        if (isWrite) this.save();
        return [{ id }];
      }
      
      if (sql.includes('INTO INTEREST_RATES')) {
        return this.upsertRate(data.interest_rates, 'country_iso', {
          country_iso: params[0],
          rate: params[1],
          source: params[2] || null,
          effective_date: params[3] || null,
        }, isWrite);
      }
      
      if (sql.includes('INTO INFLATION_RATES')) {
        return this.upsertRate(data.inflation_rates, 'country_iso', {
          country_iso: params[0],
          rate: params[1],
          period: params[2] || 'yearly',
          source: params[3] || null,
          effective_date: params[4] || null,
        }, isWrite);
      }
      
      if (sql.includes('INTO EXCHANGE_RATES')) {
        return this.upsertExchangeRate(data.exchange_rates, {
          country_iso: params[0],
          currency_code: params[1],
          rate_to_usd: params[2],
          source: params[3] || null,
          effective_date: params[4] || null,
        }, isWrite);
      }
    }

    return [];
  }

  private upsertRate(
    rates: any[], 
    key: string, 
    newRate: any,
    isWrite: boolean
  ): any[] {
    const existing = rates.findIndex((r: any) => r[key] === newRate[key]);
    const id = existing >= 0 
      ? rates[existing].id 
      : (rates.length > 0 ? Math.max(...rates.map((r: any) => r.id || 0)) + 1 : 1);
    
    const rate = {
      id,
      ...newRate,
      updated_at: new Date().toISOString(),
    };
    
    if (existing >= 0) {
      rates[existing] = rate;
    } else {
      rates.push(rate);
    }
    
    if (isWrite) this.save();
    return [{ id }];
  }

  private upsertExchangeRate(rates: any[], newRate: any, isWrite: boolean): any[] {
    const existing = rates.findIndex(
      (r: any) => r.country_iso === newRate.country_iso && r.currency_code === newRate.currency_code
    );
    const id = existing >= 0 
      ? rates[existing].id 
      : (rates.length > 0 ? Math.max(...rates.map((r: any) => r.id || 0)) + 1 : 1);
    
    const rate = {
      id,
      ...newRate,
      updated_at: new Date().toISOString(),
    };
    
    if (existing >= 0) {
      rates[existing] = rate;
    } else {
      rates.push(rate);
    }
    
    if (isWrite) this.save();
    return [{ id }];
  }
}

export const db = new SimpleDatabase() as any;

// Initialize database schema
export function initializeDatabase() {
  const data = (db as any).data;
  
  // Schema is handled by the JSON structure itself
  // Just ensure the file exists
  if (!fs.existsSync(dbPath)) {
    saveDb(emptyDb);
  }
  
  console.log('Database initialized successfully');
}
