import { useEffect, useState } from 'react';
import { Heart, History, MessageSquareText, PackageOpen, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api, getApiErrorMessage } from '../services/api';
import '../components/Common.css';
import './Dashboard.css';

const sections = [
  { id: 'overview', label: 'Overview', icon: ShoppingBag },
  { id: 'favorites', label: 'Favorite farmers', icon: Heart },
  { id: 'orders', label: 'Order history', icon: History },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
];
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const { records: orders, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useApiCollection(api.orders.customer);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [actionError, setActionError] = useState('');
  const { records: reviews, loading: reviewsLoading, error: reviewsError, reload: reloadReviews } = useApiCollection(api.reviews.customer);
  const farmers = profile?.favorites?.farmers || [];

  useEffect(() => { document.title = 'Customer dashboard | MarketLink'; }, []);
  useEffect(() => {
    let current = true;
    api.user.profile()
      .then((user) => { if (current) setProfile(user); })
      .catch((error) => { if (current) setProfileError(getApiErrorMessage(error)); })
      .finally(() => { if (current) setProfileLoading(false); });
    return () => { current = false; };
  }, []);

  async function removeFavorite(farmerId) {
    setActionError('');
    try {
      await api.user.toggleFavorite('farmer', farmerId);
      const user = await api.user.profile();
      setProfile(user);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  return (
    <div className="page-shell customer-dashboard">
      <div className="content-width">
        <header className="page-intro"><div><span className="eyebrow">Customer workspace</span><h1>Your dashboard</h1><p>Keep your market activity and saved places together.</p></div><Link className="button button-primary" to="/products">Browse harvest</Link></header>
        <div className="customer-layout">
          <nav className="customer-nav panel" aria-label="Customer dashboard"><span className="nav-caption">Workspace</span>{sections.map(({ id, label, icon: Icon }) => <button type="button" className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)} key={id}><Icon size={17} />{label}</button>)}</nav>
          <section className="customer-workspace">
            <AsyncStatus loading={profileLoading || ordersLoading || (activeSection === 'reviews' && reviewsLoading)} error={profileError || ordersError || (activeSection === 'reviews' ? reviewsError : '')} onRetry={() => { reloadOrders(); reloadReviews(); }} />
            {actionError && <p className="form-error" role="alert">{actionError}</p>}
            {activeSection === 'overview' && <><div className="dashboard-welcome panel"><span className="eyebrow">Your market, at a glance</span><h2>{profile ? `Welcome, ${profile.firstName}` : 'Welcome to your MarketLink'}</h2><p>Your orders and saved farmers update from your MarketLink account.</p></div><div className="customer-metrics"><article className="metric-panel panel"><span>Active orders</span><strong>{orders.length || '—'}</strong><PackageOpen size={20} /></article><article className="metric-panel panel"><span>Saved farmers</span><strong>{farmers.length || '—'}</strong><Heart size={20} /></article><article className="metric-panel panel"><span>Reviews shared</span><strong>{reviews.length || '—'}</strong><Star size={20} /></article></div><div className="dashboard-empty-grid"><article className="panel"><div className="section-title"><h2>Recent orders</h2><button type="button" onClick={() => setActiveSection('orders')}>View all</button></div>{orders.length ? orders.slice(0, 3).map((order) => <div className="customer-order-row" key={order._id}><strong>{order.market?.name || order.farmer?.farmerProfile?.stallName || 'Market order'}</strong><span>{order.status} · {new Date(order.pickupDate).toLocaleDateString()}</span></div>) : <EmptyState title="No active orders" detail="Your order updates will appear here." icon={PackageOpen} />}</article><article className="panel"><div className="section-title"><h2>Saved farmers</h2><button type="button" onClick={() => setActiveSection('favorites')}>View all</button></div>{farmers.length ? farmers.slice(0, 3).map((farmer) => <div className="customer-order-row" key={farmer._id}><strong>{farmer.farmerProfile?.stallName || `${farmer.firstName} ${farmer.lastName}`}</strong><span>{farmer.farmerProfile?.description}</span></div>) : <EmptyState title="No saved farmers yet" detail="Save farmers to keep their listings close." icon={Heart} />}</article></div></>}
            {activeSection === 'favorites' && <div className="workspace-panel panel"><div className="section-title"><div><span className="eyebrow">Your shortlist</span><h2>Favorite farmers</h2></div><span>{farmers.length} saved</span></div>{farmers.length ? farmers.map((farmer) => <div className="customer-order-row" key={farmer._id}><strong>{farmer.farmerProfile?.stallName || `${farmer.firstName} ${farmer.lastName}`}</strong><span>{farmer.farmerProfile?.description}</span><button className="table-action danger" type="button" onClick={() => removeFavorite(farmer._id)}>Remove favorite</button></div>) : <EmptyState title="No saved farmers yet" detail="Farmers you save will be available here." icon={Heart} />}</div>}
            {activeSection === 'orders' && <div className="workspace-panel panel"><div className="section-title"><div><span className="eyebrow">Purchases</span><h2>Order history</h2></div><span>{orders.length} orders</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Placed</th><th>Market / farmer</th><th>Pickup</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>{order._id.slice(-7)}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{order.market?.name || order.farmer?.farmerProfile?.stallName || `${order.farmer?.firstName || ''} ${order.farmer?.lastName || ''}`}</td><td>{new Date(order.pickupDate).toLocaleDateString()} · {order.pickupTimeSlot}</td><td>{order.status}</td><td>{order.totalAmount}</td></tr>)}</tbody></table>{!orders.length && <div className="blank-table-note">No past orders</div>}</div></div>}
            {activeSection === 'reviews' && <div className="workspace-panel panel"><div className="section-title"><div><span className="eyebrow">Community</span><h2>Your reviews</h2></div><span>{reviews.length} reviews</span></div>{reviews.length ? reviews.map((review) => <div className="customer-order-row" key={review._id}><strong>{review.farmer?.farmerProfile?.stallName || `${review.farmer?.firstName || ''} ${review.farmer?.lastName || ''}`}</strong><span>{review.rating} / 5 · {new Date(review.createdAt).toLocaleDateString()}</span><p>{review.comment}</p>{review.farmerResponse?.comment && <p>Your farmer replied: {review.farmerResponse.comment}</p>}</div>) : <EmptyState title="No reviews yet" detail="Reviews you submit will appear here." icon={Star} />}</div>}
          </section>
        </div>
      </div>
    </div>
  );
}