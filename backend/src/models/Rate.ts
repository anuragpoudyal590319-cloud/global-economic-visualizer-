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

export interface GDPGrowthRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface UnemploymentRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface GovernmentDebtRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface GDPPerCapitaRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface TradeBalanceRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface CurrentAccountRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface FDIRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface PopulationGrowthRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface LifeExpectancyRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface GiniCoefficientRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

export interface ExportsRate {
  id: number;
  country_iso: string;
  rate: number;
  source?: string;
  effective_date?: string;
  updated_at: string;
}

// Helper to filter for latest unique per country
const getLatestUnique = <T extends { country_iso: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  // Items are already sorted by date DESC in database.ts runQuery
  return items.filter(item => {
    if (seen.has(item.country_iso)) return false;
    seen.add(item.country_iso);
    return true;
  });
};

export const RateModel = {
  // Interest Rates
  getInterestRates: (): Array<InterestRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        ir.*,
        c.name as country_name
      FROM interest_rates ir
      LEFT JOIN countries c ON ir.country_iso = c.iso_code
      ORDER BY ir.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<InterestRate & { country_name?: string }>);
  },

  upsertInterestRate: (rate: Omit<InterestRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
        INSERT INTO interest_rates (country_iso, rate, source, effective_date)
        VALUES (?, ?, ?, ?)
      `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Inflation Rates
  getInflationRates: (): Array<InflationRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        inf.*,
        c.name as country_name
      FROM inflation_rates inf
      LEFT JOIN countries c ON inf.country_iso = c.iso_code
      ORDER BY inf.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<InflationRate & { country_name?: string }>);
  },

  upsertInflationRate: (rate: Omit<InflationRate, 'id' | 'updated_at'>): void => {
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
  },

  // Exchange Rates
  getExchangeRates: (): Array<ExchangeRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        er.*,
        c.name as country_name
      FROM exchange_rates er
      LEFT JOIN countries c ON er.country_iso = c.iso_code
      ORDER BY er.effective_date DESC
    `);
    const all = stmt.all() as Array<ExchangeRate & { country_name?: string }>;
    // Exchange rates are unique by Country AND Currency.
    return getLatestUnique(all);
  },

  upsertExchangeRate: (rate: Omit<ExchangeRate, 'id' | 'updated_at'>): void => {
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
  },

  // GDP Growth Rates
  getGDPGrowthRates: (): Array<GDPGrowthRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        g.*,
        c.name as country_name
      FROM gdp_growth_rates g
      LEFT JOIN countries c ON g.country_iso = c.iso_code
      ORDER BY g.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<GDPGrowthRate & { country_name?: string }>);
  },

  upsertGDPGrowthRate: (rate: Omit<GDPGrowthRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO gdp_growth_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Unemployment Rates
  getUnemploymentRates: (): Array<UnemploymentRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        u.*,
        c.name as country_name
      FROM unemployment_rates u
      LEFT JOIN countries c ON u.country_iso = c.iso_code
      ORDER BY u.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<UnemploymentRate & { country_name?: string }>);
  },

  upsertUnemploymentRate: (rate: Omit<UnemploymentRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO unemployment_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Government Debt Rates
  getGovernmentDebtRates: (): Array<GovernmentDebtRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        gd.*,
        c.name as country_name
      FROM government_debt_rates gd
      LEFT JOIN countries c ON gd.country_iso = c.iso_code
      ORDER BY gd.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<GovernmentDebtRate & { country_name?: string }>);
  },

  upsertGovernmentDebtRate: (rate: Omit<GovernmentDebtRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO government_debt_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // GDP Per Capita Rates
  getGDPPerCapitaRates: (): Array<GDPPerCapitaRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        g.*,
        c.name as country_name
      FROM gdp_per_capita_rates g
      LEFT JOIN countries c ON g.country_iso = c.iso_code
      ORDER BY g.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<GDPPerCapitaRate & { country_name?: string }>);
  },

  upsertGDPPerCapitaRate: (rate: Omit<GDPPerCapitaRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO gdp_per_capita_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Trade Balance Rates
  getTradeBalanceRates: (): Array<TradeBalanceRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        c.name as country_name
      FROM trade_balance_rates t
      LEFT JOIN countries c ON t.country_iso = c.iso_code
      ORDER BY t.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<TradeBalanceRate & { country_name?: string }>);
  },

  upsertTradeBalanceRate: (rate: Omit<TradeBalanceRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO trade_balance_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Current Account Rates
  getCurrentAccountRates: (): Array<CurrentAccountRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        ca.*,
        c.name as country_name
      FROM current_account_rates ca
      LEFT JOIN countries c ON ca.country_iso = c.iso_code
      ORDER BY ca.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<CurrentAccountRate & { country_name?: string }>);
  },

  upsertCurrentAccountRate: (rate: Omit<CurrentAccountRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO current_account_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // FDI Rates
  getFDIRates: (): Array<FDIRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        f.*,
        c.name as country_name
      FROM fdi_rates f
      LEFT JOIN countries c ON f.country_iso = c.iso_code
      ORDER BY f.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<FDIRate & { country_name?: string }>);
  },

  upsertFDIRate: (rate: Omit<FDIRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO fdi_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Population Growth Rates
  getPopulationGrowthRates: (): Array<PopulationGrowthRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        p.*,
        c.name as country_name
      FROM population_growth_rates p
      LEFT JOIN countries c ON p.country_iso = c.iso_code
      ORDER BY p.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<PopulationGrowthRate & { country_name?: string }>);
  },

  upsertPopulationGrowthRate: (rate: Omit<PopulationGrowthRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO population_growth_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Life Expectancy Rates
  getLifeExpectancyRates: (): Array<LifeExpectancyRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        l.*,
        c.name as country_name
      FROM life_expectancy_rates l
      LEFT JOIN countries c ON l.country_iso = c.iso_code
      ORDER BY l.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<LifeExpectancyRate & { country_name?: string }>);
  },

  upsertLifeExpectancyRate: (rate: Omit<LifeExpectancyRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO life_expectancy_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Gini Coefficient Rates
  getGiniCoefficientRates: (): Array<GiniCoefficientRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        g.*,
        c.name as country_name
      FROM gini_coefficient_rates g
      LEFT JOIN countries c ON g.country_iso = c.iso_code
      ORDER BY g.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<GiniCoefficientRate & { country_name?: string }>);
  },

  upsertGiniCoefficientRate: (rate: Omit<GiniCoefficientRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO gini_coefficient_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // Exports Rates
  getExportsRates: (): Array<ExportsRate & { country_name?: string }> => {
    const stmt = db.prepare(`
      SELECT 
        e.*,
        c.name as country_name
      FROM exports_rates e
      LEFT JOIN countries c ON e.country_iso = c.iso_code
      ORDER BY e.effective_date DESC
    `);
    return getLatestUnique(stmt.all() as Array<ExportsRate & { country_name?: string }>);
  },

  upsertExportsRate: (rate: Omit<ExportsRate, 'id' | 'updated_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO exports_rates (country_iso, rate, source, effective_date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(rate.country_iso, rate.rate, rate.source || null, rate.effective_date || null);
  },

  // HISTORICAL DATA
  // Returns all records for a country, sorted by date ASC (for chart)
  getHistoricalRates: (countryIso: string, type: 'interest' | 'inflation' | 'exchange' | 'gdp' | 'unemployment' | 'government-debt' | 'gdp-per-capita' | 'trade-balance' | 'current-account' | 'fdi' | 'population-growth' | 'life-expectancy' | 'gini-coefficient' | 'exports'): any[] => {
    let table = '';
    switch (type) {
      case 'interest': table = 'interest_rates'; break;
      case 'inflation': table = 'inflation_rates'; break;
      case 'exchange': table = 'exchange_rates'; break;
      case 'gdp': table = 'gdp_growth_rates'; break;
      case 'unemployment': table = 'unemployment_rates'; break;
      case 'government-debt': table = 'government_debt_rates'; break;
      case 'gdp-per-capita': table = 'gdp_per_capita_rates'; break;
      case 'trade-balance': table = 'trade_balance_rates'; break;
      case 'current-account': table = 'current_account_rates'; break;
      case 'fdi': table = 'fdi_rates'; break;
      case 'population-growth': table = 'population_growth_rates'; break;
      case 'life-expectancy': table = 'life_expectancy_rates'; break;
      case 'gini-coefficient': table = 'gini_coefficient_rates'; break;
      case 'exports': table = 'exports_rates'; break;
      default: return [];
    }

    // Note: SELECT * FROM ... returns sorted DESC by effective_date from database.ts
    // We fetch ALL and filter here. Ideally DB does this, but for JSON DB this is fine.

    const stmt = db.prepare(`SELECT * FROM ${table}`);
    const all = stmt.all();

    // Filter by country
    const countryData = all.filter((r: any) => r.country_iso === countryIso);

    // Sort ASC for charts
    return countryData.sort((a: any, b: any) => {
      const dateA = new Date(a.effective_date || a.updated_at).getTime();
      const dateB = new Date(b.effective_date || b.updated_at).getTime();
      return dateA - dateB;
    });
  }
};
