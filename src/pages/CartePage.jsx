import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

// Configuration des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Icône rouge pour la position actuelle
const userLocationIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-location-marker' // Classe CSS pour styliser
});

function CartePage() {
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Chargement des hôpitaux pour la carte...');
        const res = await api.get('/hopitaux');
        console.log('📍 Hôpitaux reçus:', res.data);
        setHopitaux(res.data);
      } catch (err) {
        console.error('❌ Erreur lors du chargement des hôpitaux:', err);
        setError('Impossible de charger les hôpitaux. Vérifiez que le serveur backend fonctionne.');
      } finally {
        setLoading(false);
      }
    }

    // Obtenir la position actuelle de l'utilisateur
    function getUserLocation() {
      if (navigator.geolocation) {
        console.log('📍 Demande de géolocalisation...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Position utilisateur obtenue:', [latitude, longitude]);
            setUserLocation([latitude, longitude]);
            setLocationError(null);
          },
          (error) => {
            console.warn('⚠️ Erreur de géolocalisation:', error.message);
            let errorMessage = '';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permission de géolocalisation refusée';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Position indisponible';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout de géolocalisation';
                break;
              default:
                errorMessage = 'Erreur de géolocalisation inconnue';
            }
            setLocationError(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        console.warn('⚠️ Géolocalisation non supportée par ce navigateur');
        setLocationError('Géolocalisation non supportée');
      }
    }

    load();
    getUserLocation();
  }, []);

  const validHopitaux = hopitaux.filter((h) => h.latitude && h.longitude && !isNaN(h.latitude) && !isNaN(h.longitude));

  // Centrer sur la position utilisateur si disponible, sinon sur le premier hôpital
  const center = userLocation
    ? userLocation
    : validHopitaux.length > 0
    ? [Number(validHopitaux[0].latitude), Number(validHopitaux[0].longitude)]
    : [-4.325, 15.322]; // Coordonnées par défaut de Kinshasa

  console.log('🗺️ Centre de la carte:', center, userLocation ? '(position utilisateur)' : '(hôpital)');
  console.log('🏥 Nombre d\'hôpitaux valides:', validHopitaux.length, '/', hopitaux.length);

  return (
    <div className="h-[70vh] bg-white rounded shadow overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌀</div>
            <p className="text-gray-500">Chargement de la carte...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <p className="text-red-600 font-medium">Erreur de chargement</p>
            <p className="text-gray-500 text-sm mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : hopitaux.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">🏥</div>
            <p className="text-gray-500">Aucun hôpital trouvé</p>
            <p className="text-sm text-gray-400 mt-2">Vérifiez les données dans la base</p>
          </div>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validHopitaux.map((h) => {
              console.log('📍 Marker pour hôpital:', h.nom, [h.latitude, h.longitude]);
              return (
                <Marker
                  key={h.id}
                  position={[Number(h.latitude), Number(h.longitude)]}
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
              );
            })}

            {/* Marqueur de position actuelle */}
            {userLocation && (
              <Marker
                key="user-location"
                position={userLocation}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <strong>Votre position</strong>
                    </div>
                    <p className="text-gray-600">
                      Latitude: {userLocation[0].toFixed(6)}<br />
                      Longitude: {userLocation[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
        </MapContainer>
      )}
    </div>
  );
}

export default CartePage;
