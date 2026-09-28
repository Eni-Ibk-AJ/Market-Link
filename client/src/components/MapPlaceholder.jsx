import { useEffect } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import './MapPlaceholder.css';

const marketMarkerIcon = divIcon({
  className: 'market-map-marker',
  html: '<span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function getCoordinates(location) {
  const rawLatitude = location.location?.latitude;
  const rawLongitude = location.location?.longitude;
  if (rawLatitude === null || rawLatitude === undefined || rawLatitude === '' || rawLongitude === null || rawLongitude === undefined || rawLongitude === '') return null;

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [latitude, longitude];
}

function MapViewport({ locations, selectedLocationId }) {
  const map = useMap();

  useEffect(() => {
    const selected = locations.find((location) => location._id === selectedLocationId);
    const selectedCoordinates = selected && getCoordinates(selected);
    if (selectedCoordinates) {
      map.flyTo(selectedCoordinates, Math.max(map.getZoom(), 12), { duration: 0.7 });
      return;
    }

    if (locations.length > 1) {
      map.fitBounds(locations.map((location) => getCoordinates(location)), { padding: [36, 36], maxZoom: 12 });
      return;
    }

    const firstCoordinates = getCoordinates(locations[0]);
    if (firstCoordinates) map.flyTo(firstCoordinates, 12, { duration: 0.7 });
  }, [locations, map, selectedLocationId]);

  return null;
}

export default function MapPlaceholder({
  title = 'Map preview',
  detail = 'A map will appear when a location is available.',
  className = '',
  locations = [],
  selectedLocationId = '',
  onSelect,
}) {
  const mappedLocations = locations.filter((location) => getCoordinates(location));
  const initialLocation = mappedLocations[0];
  const initialCenter = initialLocation ? getCoordinates(initialLocation) : null;

  if (!initialCenter) {
    return (
      <div className={`map-placeholder map-empty-state ${className}`} role="status">
        <div className="map-lines" />
        <div className="map-message"><strong>{title}</strong><span>{detail}</span></div>
      </div>
    );
  }

  return (
    <div className={`map-placeholder leaflet-map ${className}`} aria-label={title}>
      <MapContainer center={initialCenter} zoom={12} scrollWheelZoom className="leaflet-map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedLocations.map((location) => (
          <Marker
            key={location._id}
            position={getCoordinates(location)}
            icon={marketMarkerIcon}
            eventHandlers={{ click: () => onSelect?.(location._id) }}
          >
            <Popup>
              <div className="market-map-popup">
                <strong>{location.name}</strong>
                {location.address && <span>{location.address}</span>}
                {location.operatingDays?.length > 0 && <span>{location.operatingDays.join(', ')}</span>}
                {(location.openingTime || location.closingTime) && <span>{location.openingTime}–{location.closingTime}</span>}
                {location.description && <p>{location.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapViewport locations={mappedLocations} selectedLocationId={selectedLocationId} />
      </MapContainer>
      <span className="map-data-count">{mappedLocations.length} mapped location{mappedLocations.length === 1 ? '' : 's'}</span>
    </div>
  );
}