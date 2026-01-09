import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

function AdminComptesPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('afya_admin_token');
      const res = await api.post('/admin/utilisateurs', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Utilisateur créé avec succès !');
      setForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'user',
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('afya_admin_token');
    navigate('/admin/login');
  };

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
            className="block px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-r-4 border-teal-700"
          >
            Créer des Comptes
          </Link>
          <Link
            to="/admin/rendez-vous"
            className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
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
          <h1 className="text-xl font-semibold">Créer des Comptes</h1>
          <div className="bg-white p-4 rounded shadow max-w-md">
            {message && <p className="mb-3 text-teal-700 text-xs">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Nom</label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Prénom</label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Téléphone</label>
                <input
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Rôle</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-700 text-white px-4 py-2 rounded text-sm hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? 'Création...' : 'Créer le compte'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminComptesPage;