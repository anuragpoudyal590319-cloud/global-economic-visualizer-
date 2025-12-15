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
};

