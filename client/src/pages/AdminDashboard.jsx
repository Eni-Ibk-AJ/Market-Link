import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Bell, Building2, CircleDollarSign, ClipboardList, Users } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api, getApiErrorMessage } from '../services/api';
import '../components/Common.css';
import './RoleDashboards.css';

const adminNav = [
  { id: 'metrics', label: 'Overview metrics', icon: BarChart3 },
  { id: 'users', label: 'Users & moderation', icon: Users },
  { id: 'markets', label: 'Markets', icon: Building2 },
  { id: 'reports', label: 'Reports & settings', icon: ClipboardList },
];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyMarket = { name: '', address: '', latitude: '', longitude: '', operatingDays: '', openingTime: '', closingTime: '', description: '' };

export default function AdminDashboard() {
  const [active, setActive] = useState('metrics');
  const [roleFilter, setRoleFilter] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const loadUsers = useCallback(() => api.admin.users(roleFilter ? { role: roleFilter } : undefined), [roleFilter]);
  const { records: users, loading: usersLoading, error: usersError, reload: reloadUsers } = useApiCollection(loadUsers);
  const { records: markets, loading: marketsLoading, error: marketsError, reload: reloadMarkets } = useApiCollection(api.markets.list);
  const [marketForm, setMarketForm] = useState(emptyMarket);
  const [editingMarketId, setEditingMarketId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });

  useEffect(() => { document.title = 'Administration | MarketLink'; }, []);
  useEffect(() => {
    let current = true;
    Promise.resolve()
      .then(() => api.admin.dashboard())
      .then((data) => { if (current) setMetrics(data); })
      .catch((requestError) => { if (current) setMetricsError(getApiErrorMessage(requestError)); })
      .finally(() => { if (current) setMetricsLoading(false); });
    return () => { current = false; };
  }, []);

  async function updateUserStatus(user, status) {
    setError(''); setNotice('');
    try {
      const result = await api.admin.updateUser(user._id, { status, verified: status === 'active' });
      setNotice(result.message); reloadUsers();
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function saveMarket(event) {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    const payload = {
      ...marketForm,
      latitude: Number(marketForm.latitude),
      longitude: Number(marketForm.longitude),
      operatingDays: marketForm.operatingDays.split(',').map((day) => day.trim()).filter(Boolean),
    };
    try {
      const result = editingMarketId ? await api.markets.update(editingMarketId, payload) : await api.markets.create(payload);
      setNotice(result.message); setMarketForm(emptyMarket); setEditingMarketId(''); reloadMarkets();
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  function editMarket(market) {
    setEditingMarketId(market._id);
    setMarketForm({
      name: market.name || '', address: market.address || '',
      latitude: market.location?.latitude ?? '', longitude: market.location?.longitude ?? '',
      operatingDays: (market.operatingDays || []).join(', '), openingTime: market.openingTime || '',
      closingTime: market.closingTime || '', description: market.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteMarket(marketId) {
    setError(''); setNotice('');
    try {
      const result = await api.markets.remove(marketId);
      setNotice(result.message); reloadMarkets();
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  return (
    <div className="role-dashboard page-shell admin-dashboard">
      <div className="content-width">
        <header className="role-heading"><div><span className="eyebrow">Platform operations</span><h1>Administration</h1><p>Manage access, market listings, and system communications.</p></div><span className="role-date">Admin portal</span></header>
        {(error || notice) && <p className={error ? 'form-error' : 'form-success'} role={error ? 'alert' : 'status'}>{error || notice}</p>}
        <div className="role-dashboard-layout">
          <DashboardSidebar label="Admin tools" items={adminNav} active={active} onChange={setActive} />
          <main className="role-workspace">
            {active === 'metrics' && <><AsyncStatus loading={metricsLoading} error={metricsError} onRetry={() => { setMetricsError(''); setMetricsLoading(true); api.admin.dashboard().then(setMetrics).catch((requestError) => setMetricsError(getApiErrorMessage(requestError))).finally(() => setMetricsLoading(false)); }} /><div className="metric-grid admin-metrics"><article className="metric-card panel"><span>Total farmers</span><strong>{metrics?.totalFarmers ?? '—'}</strong><Users size={20} /></article><article className="metric-card panel"><span>Total customers</span><strong>{metrics?.totalCustomers ?? '—'}</strong><Users size={20} /></article><article className="metric-card panel"><span>Markets</span><strong>{metrics?.totalMarkets ?? '—'}</strong><Building2 size={20} /></article><article className="metric-card panel"><span>Completed-order revenue</span><strong>{metrics?.totalRevenue ?? '—'}</strong><CircleDollarSign size={20} /></article></div><section className="workspace-card panel"><div className="role-section-heading"><div><span className="eyebrow">Platform activity</span><h2>Activity overview</h2><p>Live counts from the MarketLink API.</p></div><BarChart3 size={21} /></div><div className="admin-chart-placeholder"><BarChart3 size={28} /><span>{metrics ? `${metrics.totalProducts} listed products · ${metrics.totalOrders} orders` : 'No analytics available'}</span></div></section></>}

            {active === 'users' && <section className="workspace-card panel"><div className="role-section-heading"><div><span className="eyebrow">Access control</span><h2>User moderation</h2><p>Review accounts, verify producers, and manage access.</p></div><span className="table-count">{users.length} users</span></div><div className="moderation-tabs">{[['', 'All users'], ['farmer', 'Farmers'], ['customer', 'Customers'], ['admin', 'Admins']].map(([value, label]) => <button className={roleFilter === value ? 'active' : ''} type="button" onClick={() => setRoleFilter(value)} key={value}>{label}</button>)}</div><AsyncStatus loading={usersLoading} error={usersError} onRetry={reloadUsers} />{!usersLoading && !usersError && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Contact</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td>{user.firstName} {user.lastName}</td><td>{user.role}</td><td>{user.email}<br />{user.phone}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td>{user.status}</td><td>{user.status !== 'active' && <button className="table-action" type="button" onClick={() => updateUserStatus(user, 'active')}>Approve</button>}{user.status !== 'suspended' && <button className="table-action danger" type="button" onClick={() => updateUserStatus(user, 'suspended')}>Suspend</button>}{user.status === 'suspended' && <button className="table-action" type="button" onClick={() => updateUserStatus(user, 'active')}>Reactivate</button>}</td></tr>)}</tbody></table>{users.length === 0 && <div className="blank-table-note">No users found</div>}</div>}</section>}

            {active === 'markets' && <><section className="workspace-card panel"><div className="role-section-heading"><div><span className="eyebrow">Directory</span><h2>{editingMarketId ? 'Edit market' : 'Market management'}</h2><p>Manage the location and operating schedule for a market.</p></div></div><form className="role-form market-admin-form" onSubmit={saveMarket}><label className="field">Market name<input value={marketForm.name} onChange={(event) => setMarketForm((current) => ({ ...current, name: event.target.value }))} required /></label><label className="field">Address<input value={marketForm.address} onChange={(event) => setMarketForm((current) => ({ ...current, address: event.target.value }))} required /></label><div className="coordinate-fields"><label className="field">Latitude<input type="number" step="any" value={marketForm.latitude} onChange={(event) => setMarketForm((current) => ({ ...current, latitude: event.target.value }))} required /></label><label className="field">Longitude<input type="number" step="any" value={marketForm.longitude} onChange={(event) => setMarketForm((current) => ({ ...current, longitude: event.target.value }))} required /></label></div><label className="field">Operating days<input value={marketForm.operatingDays} onChange={(event) => setMarketForm((current) => ({ ...current, operatingDays: event.target.value }))} placeholder={weekdays.join(', ')} /></label><div className="coordinate-fields"><label className="field">Opening time<input value={marketForm.openingTime} onChange={(event) => setMarketForm((current) => ({ ...current, openingTime: event.target.value }))} placeholder="08:00 AM" required /></label><label className="field">Closing time<input value={marketForm.closingTime} onChange={(event) => setMarketForm((current) => ({ ...current, closingTime: event.target.value }))} placeholder="02:00 PM" required /></label></div><label className="field">Description<textarea value={marketForm.description} onChange={(event) => setMarketForm((current) => ({ ...current, description: event.target.value }))} /></label><div className="market-form-action"><button className="button button-light" type="button" onClick={() => { setEditingMarketId(''); setMarketForm(emptyMarket); }}>Clear form</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingMarketId ? 'Save changes' : 'Add market'}</button></div></form></section><section className="workspace-card panel"><div className="role-section-heading"><h2>Market directory</h2><span className="table-count">{markets.length} active markets</span></div><AsyncStatus loading={marketsLoading} error={marketsError} onRetry={reloadMarkets} />{!marketsLoading && !marketsError && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Market</th><th>Location</th><th>Schedule</th><th>Hours</th><th>Actions</th></tr></thead><tbody>{markets.map((market) => <tr key={market._id}><td>{market.name}</td><td>{market.address}<br />{market.location?.latitude}, {market.location?.longitude}</td><td>{market.operatingDays?.join(', ')}</td><td>{market.openingTime}–{market.closingTime}</td><td><button className="table-action" type="button" onClick={() => editMarket(market)}>Edit</button><button className="table-action danger" type="button" onClick={() => deleteMarket(market._id)}>Delete</button></td></tr>)}</tbody></table>{markets.length === 0 && <div className="blank-table-note">No markets listed yet</div>}</div>}</section></>}

            {active === 'reports' && <><section className="workspace-card panel"><div className="role-section-heading"><div><span className="eyebrow">Insights</span><h2>Reports</h2><p>The current backend exposes platform counts and completed-order revenue only.</p></div><BarChart3 size={21} /></div><EmptyState title="Detailed reports are not available yet" detail="No report-generation endpoint is defined in the server." icon={ClipboardList} /></section><section className="workspace-card panel"><div className="role-section-heading"><div><span className="eyebrow">System communication</span><h2>Announcement publisher</h2><p>Announcement publishing is unavailable until the server exposes a route for it.</p></div><Bell size={21} /></div><form className="role-form" onSubmit={(event) => event.preventDefault()}><label className="field">Announcement title<input value={announcement.title} onChange={(event) => setAnnouncement((current) => ({ ...current, title: event.target.value }))} placeholder="Enter a title" /></label><label className="field">Message<textarea value={announcement.message} onChange={(event) => setAnnouncement((current) => ({ ...current, message: event.target.value }))} placeholder="Write an announcement" /></label><div className="form-bottom"><span>Connect a publishing endpoint to enable this form.</span><button className="button button-primary" type="button" disabled>Publishing unavailable</button></div></form></section></>}
          </main>
        </div>
      </div>
    </div>
  );
}