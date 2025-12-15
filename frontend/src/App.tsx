import { useEffect, useMemo, useState } from 'react';
import Map from './components/Map';
import { Country, RateData } from './types';
import { api } from './utils/api';
import './App.css';

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [interestData, setInterestData] = useState<RateData[]>([]);
  const [inflationData, setInflationData] = useState<RateData[]>([]);
  const [exchangeData, setExchangeData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const countriesByIso = useMemo(() => {
    const m = new globalThis.Map<string, Country>();
    for (const c of countries) m.set(c.iso_code.toUpperCase(), c);
    return m;
  }, [countries]);

  const ratesByIso = useMemo(() => {
    const build = (rows: RateData[]) => {
      const m = new globalThis.Map<string, RateData>();
      for (const r of rows) m.set(r.country_iso.toUpperCase(), r);
      return m;
    };
    return {
      interest: build(interestData),
      inflation: build(inflationData),
      exchange: build(exchangeData),
    };
  }, [interestData, inflationData, exchangeData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [countriesResp, interest, inflation, exchange] = await Promise.all([
          api.getCountries(),
          api.getInterestRates(),
          api.getInflationRates(),
          api.getExchangeRates(),
        ]);

        setCountries(countriesResp);
        setInterestData(interest);
        setInflationData(inflation);
        setExchangeData(exchange);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openCountry = (iso: string) => {
    const cleaned = iso.trim().toUpperCase();
    if (!cleaned) return;
    setSelectedIso(cleaned);
    setDrawerOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;

    // Accept ISO2 directly
    if (/^[A-Za-z]{2}$/.test(q)) {
      openCountry(q);
      return;
    }

    const lower = q.toLowerCase();
    const match = countries.find((c) => c.name.toLowerCase() === lower) ||
      countries.find((c) => c.name.toLowerCase().includes(lower));

    if (match) {
      openCountry(match.iso_code);
      setSearchValue(match.name);
    }
  };

  const selectedCountry = selectedIso ? countriesByIso.get(selectedIso) : undefined;
  const selectedInterest = selectedIso ? ratesByIso.interest.get(selectedIso) : undefined;
  const selectedInflation = selectedIso ? ratesByIso.inflation.get(selectedIso) : undefined;
  const selectedExchange = selectedIso ? ratesByIso.exchange.get(selectedIso) : undefined;

  const formatValue = (type: 'interest' | 'inflation' | 'exchange', v?: number) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (type === 'exchange') return v.toFixed(4);
    return `${v.toFixed(2)}%`;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Economic Data World Map</h1>
            <p className="subtitle">Explore interest rates, inflation, and exchange rates by country</p>
          </div>
          <div className="header-right">
            <form className="search" onSubmit={handleSearchSubmit}>
              <input
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search country (e.g., India or IN)…"
                list="country-list"
                aria-label="Search country"
              />
              <datalist id="country-list">
                {countries.slice(0, 250).map((c) => (
                  <option key={c.iso_code} value={c.name} />
                ))}
              </datalist>
              <button className="search-button" type="submit">Go</button>
            </form>

            <div className="header-badges">
              <span className="badge">Fast</span>
              <span className="badge">Free</span>
              <span className="badge">Cached</span>
            </div>
          </div>
        </div>
      </header>

      <div className="maps-grid">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading maps...</p>
          </div>
        )}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Make sure the backend is running on http://localhost:3001
            </p>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="map-panel">
              <div className="map-panel-title">Interest Rates</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="interest"
                  rateData={interestData}
                  selectedIso={selectedIso}
                  onSelectCountry={(iso) => openCountry(iso)}
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Inflation Rates</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="inflation"
                  rateData={inflationData}
                  selectedIso={selectedIso}
                  onSelectCountry={(iso) => openCountry(iso)}
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Exchange Rates</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="exchange"
                  rateData={exchangeData}
                  selectedIso={selectedIso}
                  onSelectCountry={(iso) => openCountry(iso)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details drawer */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">
              {selectedCountry?.name || (selectedIso ? selectedIso : 'Country')}
            </div>
            <div className="drawer-subtitle">
              {selectedIso ? selectedIso : '—'}
              {selectedCountry?.iso_code_3 ? ` • ${selectedCountry.iso_code_3}` : ''}
              {selectedCountry?.region ? ` • ${selectedCountry.region}` : ''}
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section-title">Metrics</div>

          <div className="metric-row">
            <div className="metric-name">Interest rate</div>
            <div className="metric-value">{formatValue('interest', selectedInterest?.value)}</div>
            <div className="metric-meta">
              {selectedInterest?.is_estimated ? 'Estimated' : 'Actual'}
              {selectedInterest?.effective_date ? ` • ${selectedInterest.effective_date}` : ''}
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-name">Inflation</div>
            <div className="metric-value">{formatValue('inflation', selectedInflation?.value)}</div>
            <div className="metric-meta">
              {selectedInflation?.is_estimated ? 'Estimated' : 'Actual'}
              {selectedInflation?.effective_date ? ` • ${selectedInflation.effective_date}` : ''}
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-name">Exchange rate (vs USD)</div>
            <div className="metric-value">{formatValue('exchange', selectedExchange?.value)}</div>
            <div className="metric-meta">
              {selectedExchange?.currency_code ? `Currency: ${selectedExchange.currency_code}` : ''}
              {selectedExchange?.is_estimated ? ' • Estimated' : ''}
            </div>
          </div>

          <div className="drawer-section-title" style={{ marginTop: 14 }}>Notes</div>
          <div className="drawer-note">
            Values marked “Estimated” are filled from regional averages to keep the map fully color-coded.
          </div>
        </div>
      </aside>

      <footer className="footer">
        <p>
          Data sources: World Bank API, exchangerate.host | 
          Map: Mapbox GL JS | 
          Built with React + TypeScript
        </p>
      </footer>
    </div>
  );
}

export default App;

