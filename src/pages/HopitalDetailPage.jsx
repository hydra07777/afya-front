import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';

function HopitalDetailPage() {
  const { id } = useParams();
  const [hopital, setHopital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/hopitaux/${id}`);
        setHopital(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!hopital) return <p>Hôpital introuvable.</p>;

  return (
    <div className="bg-white p-4 rounded shadow space-y-3 text-sm">
      <h1 className="text-xl font-semibold">{hopital.nom}</h1>
      <p className="text-gray-700">{hopital.adresse}, {hopital.ville}</p>
      {hopital.telephone && <p>Tél : {hopital.telephone}</p>}
      {hopital.email && <p>Email : {hopital.email}</p>}
      {hopital.site_web && (
        <p>
          Site web :{' '}
          <a href={hopital.site_web} target="_blank" rel="noreferrer" className="text-teal-700 underline">
            {hopital.site_web}
          </a>
        </p>
      )}
      {hopital.description && <p className="mt-2">{hopital.description}</p>}

      {hopital.Specialites && hopital.Specialites.length > 0 && (
        <div className="mt-3">
          <h2 className="font-semibold mb-1 text-sm">Spécialités</h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {hopital.Specialites.map((s) => (
              <li key={s.id} className="bg-gray-100 px-2 py-1 rounded">
                {s.nom}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <Link
          to={`/rendez-vous?hopitalId=${hopital.id}`}
          className="bg-teal-700 text-white px-4 py-2 rounded text-sm"
        >
          Prendre rendez-vous
        </Link>
        <Link
          to="/carte"
          className="border border-teal-700 text-teal-700 px-4 py-2 rounded text-sm"
        >
          Voir sur la carte
        </Link>
      </div>
    </div>
  );
}

export default HopitalDetailPage;
