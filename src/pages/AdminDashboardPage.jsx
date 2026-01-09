import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/client.js';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('afya_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    async function load() {
      try {
        const res = await api.get('/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Session expirée, veuillez vous reconnecter.');
        localStorage.removeItem('afya_admin_token');
        navigate('/admin/login');
      }
    }

    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('afya_admin_token');
    navigate('/admin/login');
  };

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p>Chargement du dashboard...</p>;

  const { stats, recentRendezVous } = data;

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
            className={`block px-4 py-2 text-sm font-medium ${
              location.pathname === '/admin'
                ? 'bg-teal-100 text-teal-700 border-r-4 border-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/hopitaux"
            className={`block px-4 py-2 text-sm font-medium ${
              location.pathname === '/admin/hopitaux'
                ? 'bg-teal-100 text-teal-700 border-r-4 border-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Gérer les Hôpitaux
          </Link>
          <Link
            to="/admin/comptes"
            className={`block px-4 py-2 text-sm font-medium ${
              location.pathname === '/admin/comptes'
                ? 'bg-teal-100 text-teal-700 border-r-4 border-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Créer des Comptes
          </Link>
          <Link
            to="/admin/rendez-vous"
            className={`block px-4 py-2 text-sm font-medium ${
              location.pathname === '/admin/rendez-vous'
                ? 'bg-teal-100 text-teal-700 border-r-4 border-teal-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
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
          <h1 className="text-xl font-semibold">Dashboard administrateur</h1>

      <section className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-gray-500">Hôpitaux référencés</p>
          <p className="text-2xl font-semibold">{stats.hopitaux}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-gray-500">Rendez-vous enregistrés</p>
          <p className="text-2xl font-semibold">{stats.rendezVous}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-gray-500">Patients enregistrés</p>
          <p className="text-2xl font-semibold">{stats.utilisateurs}</p>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow text-sm">
        <h2 className="font-semibold mb-2 text-base">Derniers rendez-vous</h2>
        {recentRendezVous.length === 0 && (
          <p className="text-xs text-gray-500">Aucun rendez-vous pour le moment.</p>
        )}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Date</th>
              <th className="text-left py-1">Patient</th>
              <th className="text-left py-1">Hôpital</th>
              <th className="text-left py-1">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recentRendezVous.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-1">{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
                <td className="py-1">{r.Utilisateur ? `${r.Utilisateur.prenom} ${r.Utilisateur.nom}` : '-'}</td>
                <td className="py-1">{r.Hopital ? r.Hopital.nom : '-'}</td>
                <td className="py-1">{r.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
