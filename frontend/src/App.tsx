import { useEffect, useMemo, useState } from 'react';
import Map from './components/Map';
import HistoryChart from './components/HistoryChart';
import { Country, RateData } from './types';
import { api } from './utils/api';
import './App.css';

function App() {
  const [countries, setCountries] = useState<Country[]>([]);

  // Data Layers
  const [interestData, setInterestData] = useState<RateData[]>([]);
  const [inflationData, setInflationData] = useState<RateData[]>([]);
  const [exchangeData, setExchangeData] = useState<RateData[]>([]);
  const [gdpData, setGdpData] = useState<RateData[]>([]);
  const [unemploymentData, setUnemploymentData] = useState<RateData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [searchValue, setSearchValue] = useState('');
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Historical Data State
  const [history, setHistory] = useState<Record<string, any[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);

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
      gdp: build(gdpData),
      unemployment: build(unemploymentData),
    };
  }, [interestData, inflationData, exchangeData, gdpData, unemploymentData]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [countriesResp, interest, inflation, exchange, gdp, unemployment] = await Promise.all([
          api.getCountries(),
          api.getInterestRates(),
          api.getInflationRates(),
          api.getExchangeRates(),
          api.getGDPGrowthRates(),
          api.getUnemploymentRates(),
        ]);

        setCountries(countriesResp);
        setInterestData(interest);
        setInflationData(inflation);
        setExchangeData(exchange);
        setGdpData(gdp);
        setUnemploymentData(unemployment);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch History on Selection
  useEffect(() => {
    if (!selectedIso || !drawerOpen) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const iso = selectedIso;
        // Fetch all history in parallel
        const [int, inf, ex, gdp, unemp] = await Promise.all([
          api.getHistoricalRates(iso, 'interest'),
          api.getHistoricalRates(iso, 'inflation'),
          api.getHistoricalRates(iso, 'exchange'),
          api.getHistoricalRates(iso, 'gdp'),
          api.getHistoricalRates(iso, 'unemployment'),
        ]);

        setHistory({
          interest: int,
          inflation: inf,
          exchange: ex,
          gdp,
          unemployment: unemp,
        });
      } catch (e) {
        console.error('Failed to fetch history', e);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedIso, drawerOpen]);

  const openCountry = (iso: string) => {
    const cleaned = iso.trim().toUpperCase();
    if (!cleaned) return;

    if (selectedIso !== cleaned) {
      setHistory({}); // Clear old history
    }
    setSelectedIso(cleaned);
    setDrawerOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;

    if (/^[A-Za-z]{2}$/.test(q)) {
      openCountry(q);
      setSearchValue('');
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
  const selectedGdp = selectedIso ? ratesByIso.gdp.get(selectedIso) : undefined;
  const selectedUnemployment = selectedIso ? ratesByIso.unemployment.get(selectedIso) : undefined;

  const formatValue = (type: 'interest' | 'inflation' | 'exchange' | 'gdp' | 'unemployment', v?: number) => {
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
            <p className="subtitle">Explore global economic indicators and historical trends</p>
          </div>
          <div className="header-right">
            <form className="search" onSubmit={handleSearchSubmit}>
              <input
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search country..."
                list="country-list"
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
              <span className="badge">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="maps-grid">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading global data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Row 1: Original Metircs */}
            <div className="map-panel">
              <div className="map-panel-title">Interest Rates</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="interest"
                  rateData={interestData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
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
                  onSelectCountry={openCountry}
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Exchange (vs USD)</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="exchange"
                  rateData={exchangeData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                />
              </div>
            </div>

            {/* Row 2: New Metrics */}
            <div className="map-panel">
              <div className="map-panel-title">GDP Growth</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="gdp"
                  rateData={gdpData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Unemployment</div>
              <div className="map-panel-canvas">
                <Map
                  dataType="unemployment"
                  rateData={unemploymentData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                />
              </div>
            </div>

            {/* Placeholder for symmetry or future metric */}
            <div className="map-panel" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
                <div>More metrics coming soon</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details drawer */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">
              {selectedCountry?.name || selectedIso || 'Country Details'}
            </div>
            <div className="drawer-subtitle">
              {selectedIso}
              {selectedCountry?.region ? ` • ${selectedCountry.region}` : ''}
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section-title">Current Indicators</div>

          {/* Metric Rows */}
          <div className="metric-row">
            <div className="metric-name">Interest Rate</div>
            <div className="metric-value">{formatValue('interest', selectedInterest?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Inflation</div>
            <div className="metric-value">{formatValue('inflation', selectedInflation?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Exchange (to USD)</div>
            <div className="metric-value">{formatValue('exchange', selectedExchange?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">GDP Growth</div>
            <div className="metric-value">{formatValue('gdp', selectedGdp?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Unemployment</div>
            <div className="metric-value">{formatValue('unemployment', selectedUnemployment?.value)}</div>
          </div>

          <div className="drawer-section-title" style={{ marginTop: '24px' }}>Historical Trends</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Interest Rate History</div>
              <HistoryChart
                data={history.interest}
                type="interest"
                color="#2196f3"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Inflation History</div>
              <HistoryChart
                data={history.inflation}
                type="inflation"
                color="#ff9800"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>GDP Growth History</div>
              <HistoryChart
                data={history.gdp}
                type="gdp"
                color="#4caf50"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Unemployment History</div>
              <HistoryChart
                data={history.unemployment}
                type="unemployment"
                color="#f44336"
                loading={loadingHistory}
              />
            </div>
          </div>

          <div className="drawer-note" style={{ marginTop: 20 }}>
            charts show up to 15 years provided by World Bank API.
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
