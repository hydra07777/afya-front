import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import HopitalDetailPage from './pages/HopitalDetailPage.jsx';
import RendezVousPage from './pages/RendezVousPage.jsx';
import InfosSantePage from './pages/InfosSantePage.jsx';
import CartePage from './pages/CartePage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminHopitauxPage from './pages/AdminHopitauxPage.jsx';
import AdminComptesPage from './pages/AdminComptesPage.jsx';
import AdminRendezVousPage from './pages/AdminRendezVousPage.jsx';
import { useTheme } from './theme/ThemeProvider.jsx';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-semibold text-lg tracking-tight flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-bold">
              AR
            </span>
            <span className="">AFYA RDC</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs md:text-sm">
            <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400">Accueil</Link>
            <Link to="/carte" className="hover:text-teal-600 dark:hover:text-teal-400">Carte</Link>
            <Link to="/rendez-vous" className="hover:text-teal-600 dark:hover:text-teal-400">Rendez-vous</Link>
            <Link to="/infos-sante" className="hover:text-teal-600 dark:hover:text-teal-400">Infos santé</Link>
            <Link to="/admin/login" className="text-[11px] opacity-70 hover:opacity-100">Admin</Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-[11px]"
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hopitaux/:id" element={<HopitalDetailPage />} />
          <Route path="/rendez-vous" element={<RendezVousPage />} />
          <Route path="/infos-sante" element={<InfosSantePage />} />
          <Route path="/carte" element={<CartePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/hopitaux" element={<AdminHopitauxPage />} />
          <Route path="/admin/comptes" element={<AdminComptesPage />} />
          <Route path="/admin/rendez-vous" element={<AdminRendezVousPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
        © {new Date().getFullYear()} AFYA RDC • Plateforme de santé en RDC
      </footer>
    </div>
  );
}

export default App;
