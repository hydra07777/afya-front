import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

function AdminHopitauxPage() {
  const navigate = useNavigate();
  const [hopitaux, setHopitaux] = useState([]);
  const [filteredHopitaux, setFilteredHopitaux] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHopital, setEditingHopital] = useState(null);
  const [editForm, setEditForm] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('afya_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    async function load() {
      try {
        const res = await api.get('/hopitaux');
        setHopitaux(res.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des hôpitaux');
      }
    }

    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('afya_admin_token');
    navigate('/admin/login');
  };

  // Filtrage des hôpitaux selon le terme de recherche
  useEffect(() => {
    const filtered = hopitaux.filter(h =>
      h.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.adresse.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHopitaux(filtered);
  }, [hopitaux, searchTerm]);

  const handleEdit = (hopital) => {
    setEditingHopital(hopital.id);
    setEditForm({
      nom: hopital.nom,
      adresse: hopital.adresse,
      telephone: hopital.telephone || '',
      email: hopital.email || '',
      description: hopital.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingHopital(null);
    setEditForm({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      description: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('afya_admin_token');
      await api.put(`/admin/hopitaux/${editingHopital}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour la liste des hôpitaux
      setHopitaux(hopitaux.map(h => 
        h.id === editingHopital ? { ...h, ...editForm } : h
      ));
      
      setEditingHopital(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la modification de l\'hôpital');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet hôpital ?')) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('afya_admin_token');
      await api.delete(`/admin/hopitaux/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Retirer l'hôpital de la liste
      setHopitaux(hopitaux.filter(h => h.id !== id));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression de l\'hôpital');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
            className="block px-4 py-2 text-sm font-medium bg-teal-100 text-teal-700 border-r-4 border-teal-700"
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
          <h1 className="text-xl font-semibold">Gérer les Hôpitaux</h1>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
          
          {/* Champ de recherche */}
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un hôpital
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou adresse de l'hôpital..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            
            {/* Liste des hôpitaux */}
            <div className="space-y-3">
              {filteredHopitaux.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun hôpital trouvé.</p>
              ) : (
                filteredHopitaux.map((h) => (
                  <div key={h.id} className="border rounded p-4">
                    {editingHopital === h.id ? (
                      // Formulaire d'édition
                      <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs mb-1">Nom</label>
                            <input
                              name="nom"
                              value={editForm.nom}
                              onChange={handleEditChange}
                              className="w-full border rounded px-3 py-2 text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Téléphone</label>
                            <input
                              name="telephone"
                              value={editForm.telephone}
                              onChange={handleEditChange}
                              className="w-full border rounded px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Adresse</label>
                          <input
                            name="adresse"
                            value={editForm.adresse}
                            onChange={handleEditChange}
                            className="w-full border rounded px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Description</label>
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="w-full border rounded px-3 py-2 text-sm"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 disabled:opacity-60"
                          >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Affichage normal
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{h.nom}</h3>
                            <p className="text-sm text-gray-600">{h.adresse}</p>
                            {h.telephone && <p className="text-sm text-gray-600">📞 {h.telephone}</p>}
                            {h.email && <p className="text-sm text-gray-600">✉️ {h.email}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(h)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(h.id)}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-60"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        {h.description && (
                          <p className="text-sm text-gray-700 mt-2">{h.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHopitauxPage;