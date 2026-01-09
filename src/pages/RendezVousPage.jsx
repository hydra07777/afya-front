import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client.js';
import jsPDF from 'jspdf';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function RendezVousPage() {
  const query = useQuery();
  const hopitalIdFromQuery = query.get('hopitalId');

  const [hopitaux, setHopitaux] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    hopital_id: hopitalIdFromQuery || '',
    specialite_id: '',
    date_heure: '',
    motif: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [hRes, sRes] = await Promise.all([
          api.get('/hopitaux'),
          api.get('/specialites')
        ]);
        setHopitaux(hRes.data);
        setSpecialites(sRes.data);
      } catch (err) {
        console.log(err);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/rendezvous', form);
      setMessage('Votre rendez-vous a été enregistré. Vous serez contacté par l\'établissement.');
      setForm({ ...form, date_heure: '', motif: '' });
      
      // Generate PDF
      generatePDF(form, response.data);
    } catch (err) {
      console.error(err);
      setMessage("Une erreur est survenue lors de l'enregistrement du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (formData, responseData) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Confirmation de Rendez-vous', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Nom: ${formData.nom}`, 20, 50);
    doc.text(`Prénom: ${formData.prenom}`, 20, 60);
    doc.text(`Email: ${formData.email}`, 20, 70);
    doc.text(`Téléphone: ${formData.telephone}`, 20, 80);
    doc.text(`Hôpital: ${hopitaux.find(h => h.id == formData.hopital_id)?.nom || 'N/A'}`, 20, 90);
    doc.text(`Spécialité: ${specialites.find(s => s.id == formData.specialite_id)?.nom || 'N/A'}`, 20, 100);
    doc.text(`Date et heure: ${new Date(formData.date_heure).toLocaleString('fr-FR')}`, 20, 110);
    doc.text(`Motif: ${formData.motif}`, 20, 120);
    
    if (responseData && responseData.id) {
      doc.text(`Numéro de rendez-vous: ${responseData.id}`, 20, 130);
    }
    
    doc.text('Merci pour votre confiance. Vous serez contacté par l\'établissement pour confirmation.', 20, 150);
    
    doc.save('rendez-vous-confirmation.pdf');
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-semibold mb-4">Prendre un rendez-vous</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1">Hôpital</label>
            <select
              name="hopital_id"
              value={form.hopital_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Sélectionner</option>
              {hopitaux.map((h) => (
                <option key={h.id} value={h.id}>{h.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Spécialité</label>
            <select
              name="specialite_id"
              value={form.specialite_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Sélectionner</option>
              {specialites.map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1">Date et heure</label>
          <input
            type="datetime-local"
            name="date_heure"
            value={form.date_heure}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Motif</label>
          <textarea
            name="motif"
            value={form.motif}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-700 text-white px-4 py-2 rounded text-sm hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
        </button>
      </form>
    </div>
  );
}

export default RendezVousPage;
