import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface AIAnalysisProps {
  countryIso: string;
  countryName: string;
  autoGenerate?: boolean;
}

export default function AIAnalysis({ countryIso, autoGenerate = false }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  // Clear state when country changes
  useEffect(() => {
    setAnalysis(null);
    setError(null);
    setCached(false);
    setLoading(false);
  }, [countryIso]);

  const generateAnalysis = async () => {
    if (!countryIso) return;

    setLoading(true);
    setError(null);
    setAnalysis(null); // Clear previous analysis

    try {
      const result = await api.getAIAnalysis(countryIso);
      setAnalysis(result.analysis);
      setCached(result.cached);
    } catch (err: any) {
      console.error('Error fetching AI analysis:', err);
      setError(err.response?.data?.error || 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate if enabled
  useEffect(() => {
    if (autoGenerate && countryIso && !loading) {
      generateAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, countryIso]);

  if (!countryIso) return null;

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            🤖 AI Economic Analysis
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            Insights based on all economic indicators
          </div>
        </div>
        {!analysis && !loading && (
          <button
            onClick={generateAnalysis}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            Generate Analysis
          </button>
        )}
      </div>

      {loading && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '14px',
        }}>
          <div style={{ marginBottom: '8px' }}>✨ Analyzing economic data...</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            This may take a few seconds
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          ⚠️ {error}
        </div>
      )}

      {analysis && (
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#333',
          whiteSpace: 'pre-wrap',
        }}>
          {analysis}
          {cached && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb',
              fontSize: '11px',
              color: '#6b7280',
              fontStyle: 'italic',
            }}>
              💾 Cached analysis (generated within last 24 hours)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

