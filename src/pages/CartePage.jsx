import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

// Correctif d’icône Leaflet pour bundlers
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function CartePage() {
  const [hopitaux, setHopitaux] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/hopitaux');
        setHopitaux(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const center = hopitaux.length
    ? [Number(hopitaux[0].latitude) || 0, Number(hopitaux[0].longitude) || 0]
    : [0, 0];

  return (
    <div className="h-[70vh] bg-white rounded shadow overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hopitaux
          .filter((h) => h.latitude && h.longitude)
          .map((h) => (
            <Marker
              key={h.id}
              position={[Number(h.latitude), Number(h.longitude)]}
              icon={icon}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{h.nom}</strong>
                  <p>{h.adresse}</p>
                  <Link
                    to={`/hopitaux/${h.id}`}
                    className="text-teal-700 underline"
                  >
                    Voir le profil
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default CartePage;
