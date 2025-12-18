import { DataType } from '../types';

// Improved color scale utilities for better visual distinction
export function getColorForValue(
  value: number | null,
  dataType: DataType,
  min: number,
  max: number
): string {
  if (value === null || isNaN(value)) {
    return '#e0e0e0'; // Light gray for missing data
  }

  // Normalize value to 0-1 range
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));

  // Improved color schemes with better visual distinction
  switch (dataType) {
    case 'interest':
      // Blue-purple gradient for interest rates (more vibrant)
      // Low: Light blue, High: Deep purple-blue
      return interpolateColorScale(
        ['#e3f2fd', '#90caf9', '#42a5f5', '#1e88e5', '#1565c0', '#0d47a1'],
        clamped
      );

    case 'inflation':
      // Red-orange-yellow gradient for inflation (higher = more concerning)
      // Low: Yellow, Medium: Orange, High: Red
      return interpolateColorScale(
        ['#fff9c4', '#fff176', '#ffb74d', '#ff9800', '#f57c00', '#d32f2f'],
        clamped
      );

    case 'exchange':
      // Green-teal gradient for exchange rates
      // Low: Light green, High: Deep teal
      return interpolateColorScale(
        ['#e8f5e9', '#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'],
        clamped
      );

    default:
      return '#e0e0e0';
  }
}

// Multi-color interpolation for smoother gradients
function interpolateColorScale(colors: string[], factor: number): string {
  if (colors.length < 2) return colors[0] || '#cccccc';

  const segmentSize = 1 / (colors.length - 1);
  const segmentIndex = Math.min(
    Math.floor(factor / segmentSize),
    colors.length - 2
  );

  const localFactor = (factor - segmentIndex * segmentSize) / segmentSize;
  const color1 = colors[segmentIndex];
  const color2 = colors[segmentIndex + 1];

  return interpolateColor(color1, color2, localFactor);
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return '#cccccc';

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

export function getValueRange(data: Array<{ value: number | null }>): { min: number; max: number } {
  const values = data
    .map((d) => d.value)
    .filter((v): v is number => v !== null && !isNaN(v));

  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// ---------- Quantile buckets (more distinguishable choropleth) ----------

function getPalette(dataType: DataType, bins: number): string[] {
  // Perceptually-uniform palettes (high contrast between steps)
  // Hard-coded to avoid extra deps.
  const palettes: Record<DataType, string[]> = {
    // Viridis-like
    interest: ['#440154', '#46327e', '#365c8d', '#277f8e', '#1fa187', '#4ac16d', '#fde725'],
    // Magma-like (good for "heat"/inflation)
    inflation: ['#000004', '#2c115f', '#721f81', '#b63679', '#f1605d', '#fca636', '#fcfdbf'],
    // Cividis-like
    exchange: ['#00204c', '#2c3e70', '#4a6479', '#5f8d7b', '#88b578', '#c9dd75', '#fffdbf'],
    // Greens (GDP Growth - High is good)
    gdp: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45'],
    // Reds (Unemployment - High is bad)
    unemployment: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d73027', '#990000'],
    // Green-to-Red (Government Debt - Low is good, High is bad)
    'government-debt': ['#238b45', '#41ab5d', '#74c476', '#ffd93d', '#ff9800', '#f44336', '#b71c1c'],
    // Gold-to-Purple (GDP Per Capita - High is good, wealth indicator)
    'gdp-per-capita': ['#fff7bc', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404', '#662506'],
    // Blue-to-Red diverging (Trade Balance - Positive is good, negative is bad)
    'trade-balance': ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#fddbc7', '#f4a582', '#d6604d', '#b2182b'],
    // Blue-to-Red diverging (Current Account - Positive is good, negative is bad)
    'current-account': ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#fddbc7', '#f4a582', '#d6604d', '#b2182b'],
    // Green gradient (FDI - High is good, investment indicator)
    'fdi': ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45'],
    // Blue gradient (Population Growth - Neutral growth indicator)
    'population-growth': ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'],
    // Green gradient (Life Expectancy - Higher is better, health indicator)
    'life-expectancy': ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45'],
    // Red gradient (Gini Coefficient - Higher is worse, inequality indicator)
    'gini-coefficient': ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
    // Blue gradient (Exports - Higher is better, trade openness)
    'exports': ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
  };

  const base = palettes[dataType] || palettes.interest;

  // If caller wants fewer bins, sample evenly from base.
  if (bins <= 1) return [base[base.length - 1]];
  if (bins === base.length) return base;

  const sampled: string[] = [];
  for (let i = 0; i < bins; i++) {
    const t = i / (bins - 1);
    const idx = Math.round(t * (base.length - 1));
    sampled.push(base[idx]);
  }
  return sampled;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.max(0, Math.min(1, q));
  const idx = Math.floor(clamped * (sorted.length - 1));
  return sorted[idx];
}

export function buildQuantileScale(
  dataType: DataType,
  values: Array<number | null>,
  bins = 7
): {
  breaks: number[]; // length bins+1, ascending
  colors: string[]; // length bins
  format: (v: number) => string;
  getBin: (value: number | null) => { idx: number; from: number; to: number } | null;
  getColor: (value: number | null) => string;
} {
  const numeric = values.filter((v): v is number => v !== null && !Number.isNaN(v));
  const sorted = [...numeric].sort((a, b) => a - b);

  const safeBins = Math.max(3, Math.min(9, Math.floor(bins)));
  const colors = getPalette(dataType, safeBins);

  if (sorted.length === 0) {
    const breaks = Array.from({ length: safeBins + 1 }, (_, i) => i);
    return {
      breaks,
      colors,
      format: (v) => {
        if (dataType === 'exchange') return v.toFixed(4);
        if (dataType === 'gdp-per-capita') return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        if (dataType === 'life-expectancy') return `${v.toFixed(1)} years`;
        if (dataType === 'gini-coefficient') return v.toFixed(2);
        return `${v.toFixed(2)}%`;
      },
      getBin: () => null,
      getColor: () => '#e0e0e0',
    };
  }

  // breaks[0] = min, breaks[last] = max, middle are quantiles
  const breaks: number[] = [];
  for (let i = 0; i <= safeBins; i++) {
    breaks.push(quantile(sorted, i / safeBins));
  }

  // Ensure non-decreasing breaks
  for (let i = 1; i < breaks.length; i++) {
    if (breaks[i] < breaks[i - 1]) breaks[i] = breaks[i - 1];
  }

  const format = (v: number) => {
    if (dataType === 'exchange') return v.toFixed(4);
    if (dataType === 'gdp-per-capita') return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (dataType === 'life-expectancy') return `${v.toFixed(1)} years`;
    if (dataType === 'gini-coefficient') return v.toFixed(2);
    return `${v.toFixed(2)}%`;
  };

  const getBin = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return null;
    
    // Handle case where all breaks are the same (all values identical)
    const allSame = breaks.every(b => b === breaks[0]);
    if (allSame && value === breaks[0]) {
      return { idx: Math.floor(safeBins / 2), from: breaks[0], to: breaks[0] };
    }
    
    // Find first break above value; bin is previous
    for (let i = 1; i < breaks.length; i++) {
      if (value <= breaks[i]) {
        return { idx: Math.max(0, i - 1), from: breaks[i - 1], to: breaks[i] };
      }
    }
    return { idx: safeBins - 1, from: breaks[breaks.length - 2], to: breaks[breaks.length - 1] };
  };

  const getColor = (value: number | null) => {
    const bin = getBin(value);
    if (!bin) return '#e0e0e0';
    return colors[Math.min(colors.length - 1, Math.max(0, bin.idx))];
  };

  return { breaks, colors, format, getBin, getColor };
}
