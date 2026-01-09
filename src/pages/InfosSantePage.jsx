import { useEffect, useState } from 'react';
import api from '../api/client.js';

function InfosSantePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/infos-sante');
        setArticles(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Infos santé</h1>
      {articles.length === 0 && <p className="text-sm text-gray-500">Aucun article pour le moment.</p>}
      <div className="space-y-3">
        {articles.map((a) => (
          <article key={a.id} className="bg-white p-3 rounded shadow text-sm">
            <h2 className="font-semibold text-base mb-1">{a.titre}</h2>
            <p className="text-xs text-gray-500 mb-2">
              {a.categorie} • {a.date_publication && new Date(a.date_publication).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-gray-700 whitespace-pre-line max-h-40 overflow-hidden">
              {a.contenu}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default InfosSantePage;
