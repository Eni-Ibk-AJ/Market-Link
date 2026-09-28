import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api } from '../services/api';
import '../components/Common.css';
import './Markets.css';

const MapPlaceholder = lazy(() => import('../components/MapPlaceholder'));

export default function Markets() {
  const [filters, setFilters] = useState({ query: '', day: '' });
  const loadMarkets = useCallback(() => api.markets.list(filters.day ? { day: filters.day } : undefined), [filters.day]);
  const { records: markets, loading, error, reload } = useApiCollection(loadMarkets);
  const matchingMarkets = markets.filter((market) => `${market.name} ${market.address}`.toLowerCase().includes(filters.query.toLowerCase()));
  const [showMap, setShowMap] = useState(true);
  const [selectedMarketId, setSelectedMarketId] = useState('');

  useEffect(() => { document.title = 'Markets | MarketLink'; }, []);

  return (
    <div className="page-shell browse-page">
      <div className="content-width">
        <header className="page-intro"><div><span className="eyebrow">Local network</span><h1>Markets & farmers</h1><p>Find a pickup point and explore the producers around it.</p></div><div className="result-count"><MapPin size={16} />{markets.length} markets</div></header>
        <div className="market-browser">
          <aside className="filter-sidebar panel">
            <div className="filter-sidebar-heading"><SlidersHorizontal size={17} /><h2>Filters</h2><button type="button" onClick={() => setFilters({ query: '', day: '' })}>Clear</button></div>
            <label className="field">Search area<input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Town, district, or postcode" /></label>
            <div className="filter-group"><h3>Operating day</h3><select className="filter-select" value={filters.day} onChange={(event) => setFilters((current) => ({ ...current, day: event.target.value }))}><option value="">Any day</option>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}</select></div>
          </aside>
          <div className="market-results">
            <div className="results-toolbar"><div><strong>Market directory</strong><span>Browse nearby listings</span></div><button className="button button-light map-toggle" type="button" aria-pressed={showMap} onClick={() => setShowMap((current) => !current)}><MapPin size={16} /> {showMap ? 'Hide map' : 'Show map'}</button></div>
            <AsyncStatus loading={loading} error={error} onRetry={reload} />
            <div className={`market-split-view ${showMap ? '' : 'map-hidden'}`}>
              {!loading && !error && (matchingMarkets.length ? <div className="market-listings">{matchingMarkets.map((market) => <button className={`market-listing panel ${selectedMarketId === market._id ? 'selected' : ''}`} type="button" key={market._id} aria-pressed={selectedMarketId === market._id} onClick={() => setSelectedMarketId(market._id)}><strong>{market.name}</strong><span>{market.address}</span><small>{market.operatingDays?.join(', ')} · {market.openingTime}–{market.closingTime}</small></button>)}</div> : <EmptyState title="No markets listed yet" detail="When markets join the network, their details will appear here." icon={MapPin} />)}
              {showMap && <Suspense fallback={<div className="map-placeholder" role="status">Loading map…</div>}><MapPlaceholder title="Market map" detail="Market locations will appear on the map as listings become available." locations={matchingMarkets} selectedLocationId={selectedMarketId} onSelect={setSelectedMarketId} /></Suspense>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}