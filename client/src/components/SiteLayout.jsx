import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, CircleUserRound, Leaf, LogOut, Search, ShoppingBasket } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getDashboardPath, useAuth } from '../context/useAuth';
import './SiteLayout.css';

export default function SiteLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountMenuPath, setAccountMenuPath] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardPath = getDashboardPath(user?.role);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Account';
  const isAccountMenuOpen = accountMenuOpen && accountMenuPath === location.pathname;

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  function handleLogout() {
    logout();
    setAccountMenuOpen(false);
    navigate('/');
  }

  function handleSearch(event) {
    event.preventDefault();
    navigate(`/products${searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : ''}`);
  }

  return (
    <div className="site-layout">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" to="/" aria-label="MarketLink home">
            <span className="brand-mark"><Leaf size={20} strokeWidth={2.4} /></span>
            <span>market<span>link</span></span>
          </Link>
          <form className="global-search" role="search" onSubmit={handleSearch}>
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search markets and produce" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search markets, farmers, produce" />
            <kbd>/</kbd>
          </form>
          <nav className="primary-nav" aria-label="Main navigation">
            <NavLink to="/markets">Markets</NavLink>
            <NavLink to="/products">Harvest</NavLink>
            <NavLink to="/vendor">For farmers</NavLink>
          </nav>
          <div className="header-actions">
            <Link className="icon-link" to="/cart" aria-label="Shopping basket"><ShoppingBasket size={20} /><span className="sr-only">Basket</span></Link>
            {isAuthenticated ? <div className="account-actions">
              <Link className="profile-link account-name" to={dashboardPath} title="Open your dashboard"><CircleUserRound size={19} /><span>{displayName}</span></Link>
              <button className="account-menu-toggle" type="button" aria-label="Open account menu" aria-expanded={isAccountMenuOpen} onClick={() => { setAccountMenuPath(location.pathname); setAccountMenuOpen((open) => !(open && accountMenuPath === location.pathname)); }}><ChevronDown size={16} /></button>
              {isAccountMenuOpen && <div className="account-menu" role="menu"><Link role="menuitem" to={dashboardPath}><CircleUserRound size={16} /> My dashboard</Link><button role="menuitem" type="button" onClick={handleLogout}><LogOut size={16} /> Sign out</button></div>}
            </div> : <div className="guest-actions"><Link className="profile-link" to="/login"><CircleUserRound size={19} /> Sign in</Link></div>}
          </div>
        </div>
      </header>
      <main className="app-main"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Link className="brand footer-brand" to="/"><span className="brand-mark"><Leaf size={18} /></span><span>market<span>link</span></span></Link>
          <p>Closer markets. Fresher harvests.</p>
          <nav aria-label="Footer navigation">
            <Link to="/markets">Markets</Link><Link to="/register">Join MarketLink</Link><Link to="/admin">Administration</Link>
          </nav>
          <span className="copyright">© {new Date().getFullYear()} MarketLink</span>
          <ArrowUpRight className="footer-arrow" size={18} aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}