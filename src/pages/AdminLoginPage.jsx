import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.setItem('afya_admin_token', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-4 rounded shadow text-sm">
      <h1 className="text-xl font-semibold mb-4">Connexion administrateur</h1>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-700 text-white px-4 py-2 rounded text-sm w-full"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export default AdminLoginPage;
