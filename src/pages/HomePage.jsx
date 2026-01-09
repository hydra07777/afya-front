import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

function HomePage() {
  const [specialites, setSpecialites] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [ville, setVille] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/specialites').then((res) => setSpecialites(res.data)).catch(() => {});
  }, []);

  const rechercher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (ville) params.ville = ville;
      if (specialite) params.specialite = specialite;
      const res = await api.get('/hopitaux', { params });
      setHopitaux(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 text-white px-6 py-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-100/90">Plateforme de santé • RDC</p>
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            Trouvez rapidement un hôpital par spécialité, près de chez vous.
          </h1>
          <p className="text-sm text-teal-50/90">
            AFYA RDC centralise les établissements de santé, spécialités et services de prise de rendez-vous
            pour faciliter votre parcours de soin.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Géolocalisation des hôpitaux
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Rendez-vous en ligne
            </span>
          </div>
        </div>
        <div className="hidden md:block text-xs text-teal-50/80">
          <p className="mb-1 font-medium text-right">Disponible 24h/24</p>
          <p className="text-right">Accédez aux informations de vos hôpitaux de référence en quelques clics.</p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900/80 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Rechercher un hôpital</h2>
        <form onSubmit={rechercher} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1">Ville</label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex : Kinshasa"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Spécialité</label>
            <select
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {specialites.map((s) => (
                <option key={s.id} value={s.nom}>{s.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-teal-700 text-white px-4 py-2 rounded text-sm hover:bg-teal-800"
            >
              {loading ? 'Recherche en cours...' : 'Rechercher'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Résultats</h2>
        {hopitaux.length === 0 && <p className="text-sm text-gray-500">Aucun hôpital trouvé pour ces critères.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {hopitaux.map((h) => (
            <div key={h.id} className="border rounded p-3 text-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-base">{h.nom}</h3>
                <p className="text-gray-600">{h.adresse}, {h.ville}</p>
                {h.telephone && <p className="text-gray-600">Tél : {h.telephone}</p>}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <Link
                  to={`/hopitaux/${h.id}`}
                  className="text-teal-700 text-xs hover:underline"
                >
                  Voir le profil
                </Link>
                <Link
                  to={`/rendez-vous?hopitalId=${h.id}`}
                  className="text-xs bg-teal-700 text-white px-2 py-1 rounded"
                >
                  Prendre rendez-vous
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
