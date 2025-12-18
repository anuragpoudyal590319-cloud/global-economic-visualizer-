import axios from 'axios';
import { Country, RateData } from '../types';

// Default to 3001 (our backend dev server port)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  getCountries: async (): Promise<Country[]> => {
    const response = await axios.get<Country[]>(`${API_URL}/countries`);
    return response.data;
  },

  getInterestRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/interest`);
    return response.data;
  },

  getInflationRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/inflation`);
    return response.data;
  },

  getExchangeRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/exchange`);
    return response.data;
  },

  getGDPGrowthRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gdp`);
    return response.data;
  },

  getUnemploymentRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/unemployment`);
    return response.data;
  },

  getGovernmentDebtRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/government-debt`);
    return response.data;
  },

  getGDPPerCapitaRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gdp-per-capita`);
    return response.data;
  },

  getTradeBalanceRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/trade-balance`);
    return response.data;
  },

  getCurrentAccountRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/current-account`);
    return response.data;
  },

  getFDIRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/fdi`);
    return response.data;
  },

  getPopulationGrowthRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/population-growth`);
    return response.data;
  },

  getLifeExpectancyRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/life-expectancy`);
    return response.data;
  },

  getGiniCoefficientRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gini-coefficient`);
    return response.data;
  },

  getExportsRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/exports`);
    return response.data;
  },

  getHistoricalRates: async (countryIso: string, type: string): Promise<any[]> => {
    const response = await axios.get<any[]>(`${API_URL}/rates/history/${countryIso}/${type}`);
    return response.data;
  },

  getAIAnalysis: async (countryIso: string): Promise<{ analysis: string; cached: boolean }> => {
    const response = await axios.get<{ analysis: string; cached: boolean }>(`${API_URL}/rates/analyze/${countryIso}`);
    return response.data;
  },
};


