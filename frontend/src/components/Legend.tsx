import { DataType, RateData } from '../types';
import { getValueRange, getColorForValue } from '../utils/colorScale';

interface LegendProps {
  dataType: DataType;
  rateData: RateData[];
}

export default function Legend({ dataType, rateData }: LegendProps) {
  const valueRange = getValueRange(rateData);
  const steps = 6; // More steps for better gradient
  const stepSize = (valueRange.max - valueRange.min) / (steps - 1);

  const getLabel = (value: number): string => {
    if (dataType === 'exchange') {
      return value.toFixed(2);
    }
    return `${value.toFixed(1)}%`;
  };

  const getTitle = (): string => {
    switch (dataType) {
      case 'interest':
        return 'Interest Rate (%)';
      case 'inflation':
        return 'Inflation Rate (%)';
      case 'exchange':
        return 'Exchange Rate (vs USD)';
      case 'gdp':
        return 'GDP Growth Rate (%)';
      case 'unemployment':
        return 'Unemployment Rate (%)';
      default:
        return 'Rate';
    }
  };


  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '14px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: '220px',
        border: '1px solid #e0e0e0',
      }}
    >
      <div style={{
        marginBottom: '10px',
        fontWeight: '600',
        fontSize: '15px',
        color: '#333',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
      }}>
        {getTitle()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Array.from({ length: steps }, (_, i) => {
          const value = valueRange.max - i * stepSize;
          const color = getColorForValue(value, dataType, valueRange.min, valueRange.max);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: color,
                  border: '2px solid #fff',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>
                {getLabel(value)}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontSize: '12px', color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#e0e0e0',
              border: '2px solid #fff',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
          <span style={{ fontWeight: '500' }}>No data</span>
        </div>
      </div>
    </div>
  );
}
