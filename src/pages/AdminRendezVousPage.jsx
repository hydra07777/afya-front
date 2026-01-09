import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

function AdminRendezVousPage() {
  const navigate = useNavigate();
  const [rendezVous, setRendezVous] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('afya_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    async function load() {
      try {
        const res = await api.get('/admin/rendez-vous', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRendezVous(res.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des rendez-vous');
      }
    }

    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('afya_admin_token');
    navigate('/admin/login');
  };

  const handleValidate = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir valider ce rendez-vous ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('afya_admin_token');
      await api.put(`/admin/rendez-vous/${id}/valider`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour le statut dans la liste
      setRendezVous(rendezVous.map(r =>
        r.id === id ? { ...r, statut: 'valide' } : r
      ));

      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la validation du rendez-vous');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('afya_admin_token');
      await api.put(`/admin/rendez-vous/${id}/annuler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour le statut dans la liste
      setRendezVous(rendezVous.map(r =>
        r.id === id ? { ...r, statut: 'annule' } : r
      ));

      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'annulation du rendez-vous');
    }
  };

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Administration</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/hopitaux"
            className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Gérer les Hôpitaux
          </Link>
          <Link
            to="/admin/comptes"
            className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Créer des Comptes
          </Link>
          <Link
            to="/admin/rendez-vous"
            className="block px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-r-4 border-teal-700"
          >
            Valider Rendez-vous
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="w-full text-xs border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-50"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Valider les Rendez-vous</h1>
          <div className="bg-white p-4 rounded shadow">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Patient</th>
                  <th className="text-left py-2">Hôpital</th>
                  <th className="text-left py-2">Statut</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rendezVous.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{new Date(r.date_heure).toLocaleString('fr-FR')}</td>
                    <td className="py-2">
                      {r.nom && r.prenom ? `${r.prenom} ${r.nom}` : 
                       r.Utilisateur ? `${r.Utilisateur.prenom} ${r.Utilisateur.nom}` : 
                       'Non spécifié'}
                    </td>
                    <td className="py-2">{r.Hopital ? r.Hopital.nom : '-'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        r.statut === 'valide' ? 'bg-green-100 text-green-800' :
                        r.statut === 'annule' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.statut === 'valide' ? 'Validé' :
                         r.statut === 'annule' ? 'Annulé' :
                         'En attente'}
                      </span>
                    </td>
                    <td className="py-2">
                      {r.statut === 'en_attente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValidate(r.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                      {r.statut === 'valide' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Annuler
                        </button>
                      )}
                      {r.statut === 'annule' && (
                        <button
                          onClick={() => handleValidate(r.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Revalider
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rendezVous.length === 0 && (
              <p className="text-xs text-gray-500 mt-4">Aucun rendez-vous à valider.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRendezVousPage;