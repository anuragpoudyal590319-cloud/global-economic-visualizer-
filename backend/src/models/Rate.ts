import { db } from '../config/database';

export interface InterestRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface InflationRate {
  id: number;
  country_iso: string;
  rate: number;
  period: string;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: number;
  country_iso: string;
  currency_code: string;
  rate_to_usd: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export const RateModel = {
  // Interest Rates
  getInterestRates: (): Array<InterestRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        ir.*,
        c.name as country_name
      FROM interest_rates ir
      LEFT JOIN countries c ON ir.country_iso = c.iso_code
      ORDER BY ir.updated_at DESC
    `);
    return stmt.all() as Array<InterestRate & { country_name?: string }>;
  },

  upsertInterestRate: (rate: Omit<InterestRate, 'id' | 'updated_at'>): void => {
    // Check if exists and update, otherwise insert
    const existing = RateModel.getInterestRates().find((r: any) => r.country_iso === rate.country_iso);
    if (existing) {
      // Update existing
      const stmt = db.prepare(`
        INSERT INTO interest_rates (country_iso, rate, source, effective_date)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
    } else {
      // Insert new
      const stmt = db.prepare(`
        INSERT INTO interest_rates (country_iso, rate, source, effective_date)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
    }
  },

  // Inflation Rates
  getInflationRates: (): Array<InflationRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        inf.*,
        c.name as country_name
      FROM inflation_rates inf
      LEFT JOIN countries c ON inf.country_iso = c.iso_code
      ORDER BY inf.updated_at DESC
    `);
    return stmt.all() as Array<InflationRate & { country_name?: string }>;
  },

  upsertInflationRate: (rate: Omit<InflationRate, 'id' | 'updated_at'>): void => {
    // Check if exists and update, otherwise insert
    const existing = RateModel.getInflationRates().find((r: any) => r.country_iso === rate.country_iso);
    if (existing) {
      // Update existing
      const stmt = db.prepare(`
        INSERT INTO inflation_rates (country_iso, rate, period, source, effective_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        rate.country_iso,
        rate.rate,
        rate.period || 'yearly',
        rate.source || null,
        rate.effective_date || null
      );
    } else {
      // Insert new
      const stmt = db.prepare(`
        INSERT INTO inflation_rates (country_iso, rate, period, source, effective_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        rate.country_iso,
        rate.rate,
        rate.period || 'yearly',
        rate.source || null,
        rate.effective_date || null
      );
    }
  },

  // Exchange Rates
  getExchangeRates: (): Array<ExchangeRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        er.*,
        c.name as country_name
      FROM exchange_rates er
      LEFT JOIN countries c ON er.country_iso = c.iso_code
      ORDER BY er.updated_at DESC
    `);
    return stmt.all() as Array<ExchangeRate & { country_name?: string }>;
  },

  upsertExchangeRate: (rate: Omit<ExchangeRate, 'id' | 'updated_at'>): void => {
    // Check if exists and update, otherwise insert
    const existing = RateModel.getExchangeRates().find(
      (r: any) => r.country_iso === rate.country_iso && r.currency_code === rate.currency_code
    );
    if (existing) {
      // Update existing
      const stmt = db.prepare(`
        INSERT INTO exchange_rates (country_iso, currency_code, rate_to_usd, source, effective_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        rate.country_iso,
        rate.currency_code,
        rate.rate_to_usd,
        rate.source || null,
        rate.effective_date || null
      );
    } else {
      // Insert new
      const stmt = db.prepare(`
        INSERT INTO exchange_rates (country_iso, currency_code, rate_to_usd, source, effective_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        rate.country_iso,
        rate.currency_code,
        rate.rate_to_usd,
        rate.source || null,
        rate.effective_date || null
      );
    }
  },
};

