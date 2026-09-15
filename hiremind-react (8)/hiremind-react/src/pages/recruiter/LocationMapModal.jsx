import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom glowing pin marker
const pinDivIcon = L.divIcon({
  className: 'pj-map-pin-wrapper',
  html: `
    <div class="pj-map-pin-glow">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#a855f7" stroke="#ffffff" stroke-width="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // India
const DEFAULT_ZOOM = 5;

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14`
  );
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json();
}

async function searchPlaces(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`
  );
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export default function LocationMapModal({ onClose, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Initialize map with default color OpenStreetMap tiles
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng, map);
      setResolving(true);
      try {
        const data = await reverseGeocode(lat, lng);
        const name = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedAddress(name);
      } catch {
        setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setResolving(false);
      }
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function placeMarker(lat, lng, mapInstance) {
    const map = mapInstance || mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: pinDivIcon }).addTo(map);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchPlaces(query.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handlePickResult(result) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setResults([]);
    setQuery(result.display_name);
    setSelectedAddress(result.display_name);
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 13);
      placeMarker(lat, lon);
    }
  }

  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 13);
          placeMarker(lat, lng);
        }
        setResolving(true);
        try {
          const data = await reverseGeocode(lat, lng);
          setSelectedAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch {
          setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setResolving(false);
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert('Unable to retrieve your location.');
      }
    );
  }

  function handleUse() {
    if (!selectedAddress) return;
    onSelect(selectedAddress);
  }

  return (
    <div
      className="pjm-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .pjm-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          // border: 1px solid rgba(85, 92, 132, 0.85); 
          padding: clamp(16px, 4vh, 32px) 16px;
          background: rgba(4, 7, 18, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .pjm-modal {
          width: 100%;
          max-width: 660px;
          max-height: min(88vh, 720px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: #090e1a;
          border: 1px solid #4a486c;
          border-radius: 20px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.95);
          padding: 22px 24px 24px;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          position: relative;
          margin: auto;
        }

        /* Modal custom scrollbar */
        .pjm-modal::-webkit-scrollbar {
          width: 5px;
        }
        .pjm-modal::-webkit-scrollbar-track {
          background: transparent;
        }
        .pjm-modal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.14);
          border-radius: 10px;
        }

        /* Header */
        .pjm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pjm-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pjm-header-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(168, 85, 247, 0.15);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          flex-shrink: 0;
        }

        .pjm-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .pjm-subtitle {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: #64748b;
        }

        .pjm-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #151d30;
          border: none;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
          flex-shrink: 0;
        }

        .pjm-close-btn svg {
          stroke: #cbd5e1;
          width: 18px;
          height: 18px;
          display: block;
        }

        .pjm-close-btn:hover {
          background: rgba(244, 63, 94, 0.25);
          color: #ffffff;
        }

        .pjm-close-btn:hover svg {
          stroke: #ffffff;
        }

        /* Search Input Bar */
        .pjm-search-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          position: relative;
          z-index: 1000;
        }

        .pjm-input-wrap {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .pjm-input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .pjm-input {
          width: 100%;
          background: #111827 !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 12px;
          padding: 11px 14px 11px 40px;
          color: #ffffff;
          font-size: 13.5px;
          transition: background 0.2s ease;
        }

        .pjm-input:focus {
          background: #141f36 !important;
        }

        .pjm-input::placeholder {
          color: #475569;
        }

        .pjm-btn-search {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
          border: none;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.35);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .pjm-btn-search:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .pjm-btn-search:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Search Results Dropdown */
        .pjm-results-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #111827 !important;
          border: none !important;
          outline: none !important;
          border-radius: 12px !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.95) !important;
          max-height: 180px;
          overflow-y: auto;
          z-index: 2000;
          padding: 4px !important;
          margin: 0 !important;
        }

        .pjm-result-item {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
          background: transparent !important;
          border: none !important;
          border-width: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          color: #cbd5e1 !important;
          font-size: 12.5px !important;
          padding: 7px 10px !important;
          margin: 0 !important;
          border-radius: 6px !important;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.35 !important;
        }

        .pjm-result-item:hover {
          background: #1e293b !important;
          color: #ffffff !important;
        }

        /* Map Container */
        .pjm-map-frame {
          width: 100%;
          height: 290px;
          border-radius: 14px;
          overflow: hidden;
          border: none;
          background: #e5e7eb;
          position: relative;
          z-index: 1;
        }

        .pjm-map-pin-wrapper {
          background: transparent !important;
          border: none !important;
        }

        .pjm-map-pin-glow {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
        }

        /* Status Strip */
        .pjm-status-strip {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: none;
        }

        .pjm-status-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(99, 102, 241, 0.15);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          flex-shrink: 0;
        }

        .pjm-status-content {
          font-size: 12px;
          line-height: 1.4;
          color: #cbd5e1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pjm-status-content strong {
          color: #ffffff;
          font-weight: 600;
          display: block;
        }

        .pjm-status-content span {
          color: #64748b;
          font-size: 11px;
        }

        /* Footer Controls */
        .pjm-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          gap: 12px;
        }


.leaflet-control-zoom {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

.leaflet-control-zoom a {
  background: #111827 !important;
  color: #f3f6f9 !important;
  width: 30px !important;
  height: 30px !important;
  line-height: 30px !important;
  font-size: 16px !important;
  display: block !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.leaflet-control-zoom a:last-child {
  border-bottom: none !important;
}

.leaflet-control-zoom a:hover {
  background: #1e293b !important;
  color: #ffffff !important;
}

        .pjm-btn-location {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.04);
          border: none;
          color: #cbd5e1;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pjm-btn-location:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .pjm-footer-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pjm-btn-cancel {
          padding: 10px 18px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.04);
          border: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pjm-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .pjm-btn-use {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 11px;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          border: none;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.35);
          transition: all 0.2s;
        }

        .pjm-btn-use:hover:not(:disabled) {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .pjm-btn-use:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Tablet Viewport Rules (<= 860px) */
        @media (max-width: 860px) {
          .pjm-overlay {
            padding-top: 72px;
            padding-bottom: 20px;
            padding-left: 14px;
            padding-right: 14px;
            align-items: flex-start;
          }

          .pjm-modal {
            max-height: calc(100vh - 96px);
            padding: 20px 18px;
          }

          .pjm-map-frame {
            height: 250px;
          }
        }

        /* Mobile Viewport Rules (<= 580px) */
        @media (max-width: 580px) {
          .pjm-overlay {
            padding-top: 64px;
            padding-bottom: 16px;
            padding-left: 10px;
            padding-right: 10px;
          }

          .pjm-modal {
            padding: 16px 14px 18px;
            max-height: calc(100vh - 80px);
          }

          .pjm-map-frame {
            height: 210px;
          }

          .pjm-header {
            margin-bottom: 12px;
          }

          .pjm-title {
            font-size: 16px;
          }

          .pjm-subtitle {
            font-size: 11.5px;
          }

          .pjm-search-row {
            margin-bottom: 10px;
          }

          .pjm-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .pjm-footer-right {
            display: flex;
            width: 100%;
            gap: 8px;
          }

          .pjm-btn-cancel,
          .pjm-btn-use {
            flex: 1;
            justify-content: center;
            text-align: center;
          }

          .pjm-btn-location {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="pjm-modal">
        {/* HEADER */}
        <div className="pjm-header">
          <div className="pjm-header-left">
            <div className="pjm-header-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="pjm-title">Pick a location</h3>
              <p className="pjm-subtitle">Search a city, address or landmark</p>
            </div>
          </div>
          <button
            type="button"
            className="pjm-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* SEARCH ROW */}
        <form className="pjm-search-row" onSubmit={handleSearch}>
          <div className="pjm-input-wrap">
            <span className="pjm-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="pjm-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city, area or address..."
            />

            {results.length > 0 && (
              <div className="pjm-results-dropdown">
                {results.map((r) => (
                  <button
                    type="button"
                    key={`${r.place_id}`}
                    className="pjm-result-item"
                    onClick={() => handlePickResult(r)}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="pjm-btn-search"
            disabled={searching || !query.trim()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {/* MAP */}
        <div ref={containerRef} className="pjm-map-frame" />

        {/* STATUS STRIP */}
        <div className="pjm-status-strip">
          <div className="pjm-status-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="pjm-status-content">
            {resolving ? (
              <strong>Looking up address…</strong>
            ) : selectedAddress ? (
              <>
                <strong>{selectedAddress}</strong>
                <span>Click anywhere on the map to change marker position.</span>
              </>
            ) : (
              <>
                <strong>Click on the map or search above to pick a location.</strong>
                <span>You can also drag the map to explore places.</span>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pjm-footer">
          <button
            type="button"
            className="pjm-btn-location"
            onClick={handleCurrentLocation}
            disabled={locating}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            {locating ? 'Locating…' : 'Use my current location'}
          </button>

          <div className="pjm-footer-right">
            <button
              type="button"
              className="pjm-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pjm-btn-use"
              onClick={handleUse}
              disabled={!selectedAddress || resolving}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Use this location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}