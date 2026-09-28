import { Link } from 'react-router-dom';
import './DashboardSidebar.css';

export default function DashboardSidebar({ label, items, active, onChange }) {
  return (
    <aside className="role-sidebar panel">
      <div className="role-switcher"><span>{label}</span><span className="status-dot" /></div>
      <nav aria-label={`${label} navigation`}>
        {items.map(({ id, label: itemLabel, icon: Icon }) => <button type="button" className={active === id ? 'active' : ''} onClick={() => onChange(id)} key={id}><Icon size={17} />{itemLabel}</button>)}
      </nav>
      <div className="role-sidebar-bottom"><span>MarketLink workspace</span><Link to="/">Back to marketplace</Link></div>
    </aside>
  );
}