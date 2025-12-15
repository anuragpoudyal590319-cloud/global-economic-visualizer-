import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DataType, RateData } from '../types';
import { buildQuantileScale } from '../utils/colorScale';

interface MapProps {
  dataType: DataType;
  rateData: RateData[];
  selectedIso?: string | null;
  onSelectCountry?: (iso: string) => void;
}

// For development, use a public token or get a free one from mapbox.com
// Free tier: 50,000 map loads per month
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// If no token, we'll use a fallback message
if (!MAPBOX_TOKEN) {
  console.warn('Mapbox token not found. Please set VITE_MAPBOX_TOKEN in your .env file');
}

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Map({ dataType, rateData, selectedIso, onSelectCountry }: MapProps) {
  // Add default values to prevent destructuring errors
  const safeDataType = dataType || 'interest';
  const safeRateData = rateData || [];
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false); // Prevent multiple initializations
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [legendCollapsed, setLegendCollapsed] = useState(true);
  const selectedFeatureIdRef = useRef<string | number | null>(null);
  const lastFocusedIsoRef = useRef<string | null>(null);

  const legendScale = useMemo(() => {
    return buildQuantileScale(
      safeDataType,
      safeRateData.map((r) => r.value),
      7
    );
  }, [safeDataType, safeRateData]);

  useEffect(() => {
    // Only initialize once
    if (!mapContainer.current || map.current || initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;
    
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is required. Please set VITE_MAPBOX_TOKEN in your environment variables.');
      return;
    }

    let isMounted = true;

    try {
      // Initialize map with better settings
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 8,
        pitch: 0,
        bearing: 0,
      });

      map.current = mapInstance;
      
      // Add controls after map loads
      mapInstance.on('load', () => {
        // Add navigation controls (zoom in/out, compass)
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add fullscreen control
        mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      });

      mapInstance.on('load', () => {
        if (isMounted) {
          setMapLoaded(true);
        }
      });

      mapInstance.on('error', (e) => {
        if (isMounted) {
          console.error('Map error:', e);
          setError('Failed to load map. Please check your Mapbox token.');
        }
      });

      // Avoid noisy style.* logs in the console
    } catch (err) {
      if (isMounted) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map.');
      }
    }

    return () => {
      isMounted = false;
      // Only cleanup on unmount, not on re-renders
      if (map.current) {
        hoverPopupRef.current?.remove();
        hoverPopupRef.current = null;
        map.current.remove();
        map.current = null;
        initializedRef.current = false;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // If no data, just show the map without coloring
    if (safeRateData.length === 0) {
      // Remove existing layer if it exists
      const layerId = 'countries-layer';
      const sourceId = 'countries';
      
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getLayer(`${layerId}-hover`)) {
        map.current.removeLayer(`${layerId}-hover`);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      hoverPopupRef.current?.remove();
      return;
    }

    // Create a map of country ISO codes to rate values
    const countryRateMap: Record<string, RateData> = {};
    safeRateData.forEach((rate) => {
      countryRateMap[rate.country_iso.toLowerCase()] = rate;
    });

    const sourceId = 'countries';
    const layerId = 'countries-layer';
    const sourceLayer = 'country_boundaries';

    // Remove existing layers if they exist
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getLayer(`${layerId}-hover`)) {
      map.current.removeLayer(`${layerId}-hover`);
    }
    if (map.current.getLayer(`${layerId}-selected`)) {
      map.current.removeLayer(`${layerId}-selected`);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }
    hoverPopupRef.current?.remove();

    // Use Natural Earth boundaries from Mapbox (free)
    // Note: This source may require a specific token scope
    const setupSourceAndLayer = () => {
      try {
        // If the style is not ready yet, wait and retry.
        if (!map.current?.isStyleLoaded()) {
          map.current?.once('idle', () => setupSourceAndLayer());
          return;
        }

        // Check if source already exists
        if (map.current!.getSource(sourceId)) {
          // Source exists, add layer immediately
          addLayerWithColors();
        } else {
          map.current!.addSource(sourceId, {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1',
            // Ensure vector features have stable ids so feature-state hover works
            promoteId: 'mapbox_id',
          });
          
          // Wait for source to load before adding layer.
          // IMPORTANT: Don't use `once` here — Mapbox emits multiple sourcedata events and the first one
          // is often NOT loaded yet (which would permanently skip layer creation).
          const onSourceData = (e: any) => {
            if (e.sourceId === sourceId && e.isSourceLoaded) {
              map.current?.off('sourcedata', onSourceData);
              addLayerWithColors();
            }
          };
          map.current!.on('sourcedata', onSourceData);
        }
      } catch (err) {
        console.warn('Could not add country boundaries source:', err);
      }
    };
    
    const addLayerWithColors = () => {
      if (!map.current) return;

      // Convert a CSS color string to RGB array for Mapbox expressions.
      // `getColorForValue()` currently returns `rgb(r,g,b)` strings (not hex),
      // so we must support both formats to avoid everything defaulting to gray.
      function colorToRgbArray(color: string): [number, number, number] {
        const c = (color || '').trim();

        // rgb(12, 34, 56) or rgba(12, 34, 56, 0.5)
        const rgbMatch = c.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/i);
        if (rgbMatch) {
          return [
            Math.max(0, Math.min(255, Number(rgbMatch[1]))),
            Math.max(0, Math.min(255, Number(rgbMatch[2]))),
            Math.max(0, Math.min(255, Number(rgbMatch[3]))),
          ];
        }

        // #rrggbb
        const hexMatch = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
          return [
            parseInt(hexMatch[1], 16),
            parseInt(hexMatch[2], 16),
            parseInt(hexMatch[3], 16),
          ];
        }

        // Fallback: light gray
        return [224, 224, 224];
      }

      // Build color lookup map - convert to RGB arrays for Mapbox
      const colorLookup: Record<string, [number, number, number]> = {};
      
      safeRateData.forEach((rate) => {
        if (!rate.country_iso) return;
        const hexColor = legendScale.getColor(rate.value);
        // Store as lowercase for case-insensitive matching
        const isoKey = rate.country_iso.toLowerCase();
        colorLookup[isoKey] = colorToRgbArray(hexColor);
      });

      // Build case expression with null safety
      const colorExpression: any[] = ['case'];
      const countriesToColor = Object.entries(colorLookup);
      
      countriesToColor.forEach(([iso, rgb]) => {
        // Use iso_3166_1 (not iso_3166_1_alpha_2) - this is what Mapbox actually provides
        colorExpression.push(
          [
            '==',
            ['downcase', ['to-string', ['coalesce', ['get', 'iso_3166_1'], '']]],
            iso
          ],
          ['rgb', rgb[0], rgb[1], rgb[2]]
        );
      });
      
      colorExpression.push(['rgb', 204, 204, 204]); // Default gray
      
      try {
        // Add the fill layer with colors ONLY for countries with data
        map.current.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: {
            'fill-color': colorExpression as any,
            'fill-opacity': 0.9,
            'fill-outline-color': '#f7f7f7',
          },
        });
        
        // Add hover layer
        map.current.addLayer({
          id: `${layerId}-hover`,
          type: 'line',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: {
            'line-color': '#ff6b35',
            'line-width': 2,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0
            ],
          },
        });

        // Add selected outline layer
        map.current.addLayer({
          id: `${layerId}-selected`,
          type: 'line',
          source: sourceId,
          'source-layer': sourceLayer,
          paint: {
            'line-color': '#111827',
            'line-width': 3,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              1,
              0
            ],
          },
        });
        
        // Add interactive handlers
        setupInteractivity();
      } catch (err) {
        console.error('Error adding layer:', err);
      }
    };
    
    const setupInteractivity = () => {
      if (!map.current) return;
      // Create one popup and reuse it on hover (fast + no flicker)
      if (!hoverPopupRef.current) {
        hoverPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          maxWidth: '340px',
          anchor: 'bottom',
          offset: 12,
        });
      }
      const popup = hoverPopupRef.current;

      let hoveredFeatureId: string | number | null = null;

      const typeLabel =
        safeDataType === 'interest'
          ? 'Interest rate'
          : safeDataType === 'inflation'
            ? 'Inflation'
            : 'Exchange rate (vs USD)';

      const formatValue = (value: number) => legendScale.format(value);

      const onMove = (e: mapboxgl.MapLayerMouseEvent) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties || ({} as any);
        const iso2 = props.iso_3166_1 ? String(props.iso_3166_1) : '';
        const isoLower = iso2 ? iso2.toLowerCase() : '';

        // Feature-state highlight (requires promoteId or native feature ids)
        const featureId = feature.id as string | number | undefined;
        if (featureId !== undefined && featureId !== null && hoveredFeatureId !== featureId) {
          if (hoveredFeatureId !== null) {
            map.current.setFeatureState({ source: sourceId, sourceLayer, id: hoveredFeatureId }, { hover: false });
          }
          hoveredFeatureId = featureId;
          map.current.setFeatureState({ source: sourceId, sourceLayer, id: hoveredFeatureId }, { hover: true });
        }

        map.current.getCanvas().style.cursor = 'pointer';

        const name: string = props.name_en || props.name || iso2 || 'Unknown';
        const region: string | undefined = props.region;
        const subregion: string | undefined = props.subregion;
        const iso3: string | undefined = props.iso_3166_1_alpha_3;

        const rate = isoLower ? countryRateMap[isoLower] : undefined;

        const container = document.createElement('div');
        container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        container.style.padding = '10px 10px 8px';
        container.style.borderRadius = '10px';
        container.style.background = 'rgba(255,255,255,0.98)';
        container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
        container.style.border = '1px solid rgba(0,0,0,0.08)';

        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.style.fontSize = '14px';
        title.style.color = '#111';
        title.textContent = name;
        container.appendChild(title);

        const meta = document.createElement('div');
        meta.style.marginTop = '2px';
        meta.style.fontSize = '12px';
        meta.style.color = '#666';
        meta.textContent = [iso2 || null, iso3 || null, region || null, subregion || null]
          .filter(Boolean)
          .join(' • ');
        container.appendChild(meta);

        const divider = document.createElement('div');
        divider.style.margin = '8px 0';
        divider.style.height = '1px';
        divider.style.background = 'rgba(0,0,0,0.08)';
        container.appendChild(divider);

        const main = document.createElement('div');
        main.style.display = 'flex';
        main.style.justifyContent = 'space-between';
        main.style.alignItems = 'baseline';
        main.style.gap = '12px';

        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.style.color = '#555';
        label.textContent = typeLabel;

        const val = document.createElement('div');
        val.style.fontSize = '16px';
        val.style.fontWeight = '800';
        val.style.color = rate ? '#1b5e20' : '#999';
        val.textContent = rate ? formatValue(rate.value) : 'No data';

        main.appendChild(label);
        main.appendChild(val);
        container.appendChild(main);

        const details = document.createElement('div');
        details.style.marginTop = '8px';
        details.style.fontSize = '12px';
        details.style.color = '#666';

        if (!rate) {
          details.textContent = 'No data available for this country yet.';
        } else {
          const updated = rate.updated_at ? new Date(rate.updated_at).toLocaleString() : '';
          const effective = rate.effective_date ? String(rate.effective_date) : '';
          const lines: string[] = [];
          if (safeDataType === 'exchange' && rate.currency_code) lines.push(`Currency: ${rate.currency_code}`);
          if (effective) lines.push(`Period: ${effective}`);
          if (rate.period) lines.push(`WB period: ${rate.period}`);
          const bin = legendScale.getBin(rate.value);
          if (bin) lines.push(`Bucket: ${legendScale.format(bin.from)}–${legendScale.format(bin.to)}`);
          if (rate.is_estimated) {
            lines.push(`Estimated (${rate.estimated_from === 'region_avg' ? 'region avg' : 'global avg'})`);
          }
          if (updated) lines.push(`Updated: ${updated}`);
          details.textContent = lines.join(' • ');
        }
        container.appendChild(details);

        popup.setLngLat(e.lngLat).setDOMContent(container).addTo(map.current);
      };

      const onLeave = () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        popup.remove();
        if (hoveredFeatureId !== null) {
          map.current.setFeatureState({ source: sourceId, sourceLayer, id: hoveredFeatureId }, { hover: false });
          hoveredFeatureId = null;
        }
      };

      // Ensure we don't stack listeners across re-renders
      map.current.off('mousemove', layerId, onMove);
      map.current.off('mouseleave', layerId, onLeave);
      map.current.on('mousemove', layerId, onMove);
      map.current.on('mouseleave', layerId, onLeave);

      // Click-to-select (opens drawer in parent)
      const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        const f = e.features[0];
        const props = f.properties || ({} as any);
        const iso2 = props.iso_3166_1 ? String(props.iso_3166_1).toUpperCase() : '';
        const fid = f.id as any;

        if (selectedFeatureIdRef.current !== null) {
          map.current.setFeatureState({ source: sourceId, sourceLayer, id: selectedFeatureIdRef.current }, { selected: false });
        }
        if (fid !== undefined && fid !== null) {
          selectedFeatureIdRef.current = fid;
          map.current.setFeatureState({ source: sourceId, sourceLayer, id: fid }, { selected: true });
        }

        if (iso2) onSelectCountry?.(iso2);
      };

      map.current.off('click', layerId, onClick);
      map.current.on('click', layerId, onClick);
    };
    
    // Start the setup
    setupSourceAndLayer();
  }, [mapLoaded, safeRateData, safeDataType]); // Dependencies

  // When a country is selected (via search or click), zoom to it on this map.
  useEffect(() => {
    if (!selectedIso || !map.current || !mapLoaded) return;
    const iso = selectedIso.toUpperCase();
    if (lastFocusedIsoRef.current === iso) return;
    lastFocusedIsoRef.current = iso;

    const sourceId = 'countries';
    const sourceLayer = 'country_boundaries';
    const tryFocus = () => {
      if (!map.current) return;
      if (!map.current.isStyleLoaded()) {
        map.current.once('idle', tryFocus);
        return;
      }
      if (!map.current.getSource(sourceId)) {
        // layers not ready yet; retry
        map.current.once('idle', tryFocus);
        return;
      }

      const features = map.current.querySourceFeatures(sourceId, {
        sourceLayer,
        filter: ['==', ['get', 'iso_3166_1'], iso],
      } as any);

      if (!features || features.length === 0) {
        map.current.once('idle', tryFocus);
        return;
      }

      const feature = features[0] as any;
      const fid = feature.id as any;
      if (selectedFeatureIdRef.current !== null) {
        map.current.setFeatureState({ source: sourceId, sourceLayer, id: selectedFeatureIdRef.current }, { selected: false });
      }
      if (fid !== undefined && fid !== null) {
        selectedFeatureIdRef.current = fid;
        map.current.setFeatureState({ source: sourceId, sourceLayer, id: fid }, { selected: true });
      }

      // Compute bounds
      const bounds = new mapboxgl.LngLatBounds();
      const geom = feature.geometry;
      const extendCoord = (coord: any) => bounds.extend(coord);

      if (geom?.type === 'Polygon') {
        for (const ring of geom.coordinates[0]) extendCoord(ring);
      } else if (geom?.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
          for (const ring of poly[0]) extendCoord(ring);
        }
      }

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 40, bottom: 40, left: 40, right: 40 },
          duration: 700,
          maxZoom: 4,
        });
      }
    };

    tryFocus();
  }, [selectedIso, mapLoaded]);

  // Cleanup on unmount is handled by the main useEffect cleanup

  const legendTitle =
    safeDataType === 'interest'
      ? 'Interest rate'
      : safeDataType === 'inflation'
        ? 'Inflation'
        : 'Exchange rate (vs USD)';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {/* On-map legend (slide-out to save space) */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          zIndex: 10,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          pointerEvents: 'auto',
          overflow: 'hidden',
        }}
      >
        {/* Header / toggle handle */}
        <button
          type="button"
          onClick={() => setLegendCollapsed((v) => !v)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '10px 10px',
            width: legendCollapsed ? 160 : 300,
            transition: 'width 180ms ease',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.92) 100%)',
            borderBottom: legendCollapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
          }}
          aria-label={legendCollapsed ? 'Expand legend' : 'Collapse legend'}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: '#222' }}>{legendTitle}</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#4f46e5',
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid rgba(79,70,229,0.25)',
              background: 'rgba(79,70,229,0.08)',
            }}
          >
            {legendCollapsed ? 'Show' : 'Hide'}
          </div>
        </button>

        {!legendCollapsed && (
          <div style={{ padding: '10px 10px 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {legendScale.colors.map((c, i) => {
                const from = legendScale.breaks[i];
                const to = legendScale.breaks[i + 1];
                const label = `${legendScale.format(from)} – ${legendScale.format(to)}`;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 18,
                        height: 12,
                        borderRadius: 4,
                        background: c,
                        border: '1px solid rgba(0,0,0,0.12)',
                        flex: '0 0 auto',
                      }}
                    />
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.2 }}>{label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#777' }}>
              Buckets are quantiles (each color represents ~equal number of countries).
            </div>
          </div>
        )}
      </div>
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
