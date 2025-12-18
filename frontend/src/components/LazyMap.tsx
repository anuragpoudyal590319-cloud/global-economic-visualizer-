import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DataType, RateData } from '../types';

// Lazy load the Map component
const Map = lazy(() => import('./Map'));

interface LazyMapProps {
  dataType: DataType;
  rateData: RateData[];
  selectedIso?: string | null;
  onSelectCountry?: (iso: string) => void;
  title: string;
}

/**
 * Lazy-loaded map component that only renders when visible
 * Uses Intersection Observer to detect when component enters viewport
 */
export default function LazyMap({ 
  dataType, 
  rateData, 
  selectedIso, 
  onSelectCountry,
  title 
}: LazyMapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, keep it loaded even if it scrolls out of view
            if (!hasLoaded) {
              setHasLoaded(true);
            }
          }
        });
      },
      {
        // Start loading when component is 200px away from viewport
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasLoaded]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      {isVisible || hasLoaded ? (
        <Suspense
          fallback={
            <div
              style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e0e0e0',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px',
                  }}
                />
                <div style={{ color: '#666', fontSize: '14px' }}>Loading {title}...</div>
              </div>
            </div>
          }
        >
          <Map
            dataType={dataType}
            rateData={rateData}
            selectedIso={selectedIso}
            onSelectCountry={onSelectCountry}
          />
        </Suspense>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            background: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-lazy-map]')) {
  style.setAttribute('data-lazy-map', 'true');
  document.head.appendChild(style);
}

