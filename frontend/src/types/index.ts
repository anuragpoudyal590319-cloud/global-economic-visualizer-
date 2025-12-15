export type DataType = 'interest' | 'inflation' | 'exchange' | 'gdp' | 'unemployment';


export interface Country {
  id: number;
  iso_code: string;
  iso_code_3?: string;
  name: string;
  region?: string;
}

export interface RateData {
  country_iso: string;
  country_name?: string;
  value: number;
  currency_code?: string | null;
  period?: string | null;
  effective_date?: string;
  updated_at: string;
  is_estimated?: boolean;
  estimated_from?: 'region_avg' | 'global_avg';
}

