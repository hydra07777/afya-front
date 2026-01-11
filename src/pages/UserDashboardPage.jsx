import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import socketManager from '../api/socket.js';

function UserDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('afya_user_token');
    if (!token) {
      navigate('/user/login');
      return;
    }

    async function load() {
      try {
        const res = await api.get('/auth/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);

        // Connexion Socket.IO avec le gestionnaire centralisé
        socketManager.connect();
        socketManager.joinHospitalRoom(res.data.hopital.id);

        // Écouter les notifications de rendez-vous
        socketManager.on('rendez-vous-notification', (notification) => {
          console.log('🔔 Nouvelle notification:', notification);
          setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder 5 dernières
        });

        // Écouter les mises à jour de rendez-vous
        socketManager.on('rendez-vous-update', (update) => {
          console.log('🔄 Mise à jour rendez-vous:', update);
          // Recharger les données si nécessaire
          load();
        });

        return () => {
          socketManager.removeAllListeners();
          socketManager.disconnect();
        };
      } catch (err) {
        console.error(err);
        setError('Session expirée, veuillez vous reconnecter.');
        localStorage.removeItem('afya_user_token');
        localStorage.removeItem('afya_user_data');
        navigate('/user/login');
      }
    }

    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('afya_user_token');
    localStorage.removeItem('afya_user_data');
    navigate('/user/login');
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Chargement du dashboard...</p>
    </div>
  );

  const { hopital, stats, recentRendezVous } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Hôpital</h1>
              <p className="text-gray-600">{hopital.nom}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Notifications récentes</h2>
            <div className="space-y-2">
              {notifications.map((notif, index) => (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-700">{notif.message}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {new Date().toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total RDV</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">En attente</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Confirmés</h3>
            <p className="text-3xl font-bold text-green-600">{stats.confirme || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Annulés</h3>
            <p className="text-3xl font-bold text-red-600">{stats.annule}</p>
          </div>
        </div>

        {/* Rendez-vous récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rendez-vous récents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRendezVous.map((rdv) => (
                  <tr key={rdv.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(rdv.date_heure).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rdv.Utilisateur ? `${rdv.Utilisateur.prenom} ${rdv.Utilisateur.nom}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                        rdv.statut === 'annule' ? 'bg-red-100 text-red-800' :
                        rdv.statut === 'valide' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rdv.statut === 'confirme' ? 'Confirmé' :
                         rdv.statut === 'annule' ? 'Annulé' :
                         rdv.statut === 'valide' ? 'Validé' :
                         'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {rdv.statut === 'en_attente' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConfirmRdv(rdv.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleCancelRdv(rdv.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleConfirmRdv(id) {
    try {
      const token = localStorage.getItem('afya_user_token');
      await api.put(`/auth/rendezvous/${id}/status`, { statut: 'confirme' }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Recharger les données
      const res = await api.get('/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la confirmation du rendez-vous');
    }
  }

  async function handleCancelRdv(id) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    try {
      const token = localStorage.getItem('afya_user_token');
      await api.put(`/auth/rendezvous/${id}/status`, { statut: 'annule' }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Recharger les données
      const res = await api.get('/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'annulation du rendez-vous');
    }
  }
}

export default UserDashboardPage;