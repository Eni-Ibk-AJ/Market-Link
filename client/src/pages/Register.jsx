import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Sprout, Store, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api, getApiErrorMessage } from '../services/api';
import '../components/Common.css';
import './Register.css';

const MapPlaceholder = lazy(() => import('../components/MapPlaceholder'));

const roles = [
  { id: 'wholesale', title: 'Wholesale & Retail Grocer', text: 'Source in volume for a shop, restaurant, or local business.', icon: Store },
  { id: 'household', title: 'Household & Family Kitchen', text: 'Find fresh staples and plan your regular market pickup.', icon: UsersRound },
  { id: 'producer', title: 'Producer / Farm Partner', text: 'Share your harvest and manage pre-orders from one place.', icon: Sprout },
];

const commodities = ['Yams', 'Grains', 'Eggs', 'Roots & tubers', 'Fresh produce', 'Legumes', 'Poultry', 'Other'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [interests, setInterests] = useState([]);
  const [alerts, setAlerts] = useState({ dispatch: false, price: false });
  const [account, setAccount] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', stallName: '' });
  const [location, setLocation] = useState({ preferredMarket: '', address: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { records: markets, loading: marketsLoading, error: marketsError, reload: reloadMarkets } = useApiCollection(api.markets.list);
  useEffect(() => { document.title = 'Create account | MarketLink'; }, []);
  const toggleInterest = (item) => setInterests((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);

  async function submitRegistration() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.auth.register({
        ...account,
        role: role === 'producer' ? 'farmer' : 'customer',
        preferredMarket: location.preferredMarket || undefined,
        deliveryAddress: location.address,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        commodityInterests: interests,
        marketAlerts: { liveDispatch: alerts.dispatch, priceAvailability: alerts.price },
      });
      setSuccess(data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page page-shell">
      <div className="content-width register-width">
        <div className="register-heading"><span className="eyebrow">Make the connection</span><h1>Set up your MarketLink</h1><p>A few details help us shape your market experience.</p></div>
        <div className="wizard-progress" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((item) => <div className={`wizard-step ${step >= item ? 'current' : ''}`} key={item}><span>{step > item ? <Check size={15} /> : `0${item}`}</span><strong>{['Your role', 'What you source', 'Your location'][item - 1]}</strong></div>)}
        </div>

        {step === 1 && <section className="wizard-panel">
          <div className="section-title"><div><span className="eyebrow">Step 01</span><h2>How will you use MarketLink?</h2></div><span className="step-count">01 / 03</span></div>
          <div className="role-options">{roles.map(({ id, title, text, icon: Icon }) => <button type="button" className={`role-option ${role === id ? 'selected' : ''}`} onClick={() => setRole(id)} key={id} aria-pressed={role === id}><span className="role-icon"><Icon size={24} /></span><strong>{title}</strong><span>{text}</span><i>{role === id && <Check size={14} />}</i></button>)}</div>
          {role && <div className="registration-fields"><label className="field">First name<input value={account.firstName} onChange={(event) => setAccount((current) => ({ ...current, firstName: event.target.value }))} required /></label><label className="field">Last name<input value={account.lastName} onChange={(event) => setAccount((current) => ({ ...current, lastName: event.target.value }))} required /></label><label className="field">Email<input type="email" value={account.email} onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))} required /></label><label className="field">Phone<input type="tel" value={account.phone} onChange={(event) => setAccount((current) => ({ ...current, phone: event.target.value }))} required /></label><label className="field">Password<input type="password" minLength="8" value={account.password} onChange={(event) => setAccount((current) => ({ ...current, password: event.target.value }))} required /></label>{role === 'producer' && <label className="field">Stall name<input value={account.stallName} onChange={(event) => setAccount((current) => ({ ...current, stallName: event.target.value }))} /></label>}</div>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <div className="registration-success" role="status"><strong>Registration received</strong><span>{success}</span><Link className="button button-primary" to="/login">Continue to sign in</Link></div>}
          {!success && <div className="form-actions"><span /><button className="button button-primary" type="button" disabled={!role || !account.firstName || !account.lastName || !account.email || !account.phone || !account.password || (role === 'producer' && !account.stallName)} onClick={() => setStep(2)}>Continue <ArrowRight size={17} /></button></div>}
        </section>}

        {step === 2 && <section className="wizard-panel">
          <div className="section-title"><div><span className="eyebrow">Step 02</span><h2>What are you interested in?</h2><p>Select any categories that matter to you. You can update these later.</p></div><span className="step-count">02 / 03</span></div>
          <div className="commodity-options">{commodities.map((item) => <button type="button" className={`commodity-option ${interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)} key={item} aria-pressed={interests.includes(item)}><span className="commodity-check">{interests.includes(item) && <Check size={15} />}</span>{item}</button>)}</div>
          <EmptyState className="interest-preview" title="Your selected interests will appear here" detail="No category selected yet" icon={Sprout} />
          <div className="form-actions"><button className="button button-light" type="button" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button><button className="button button-primary" type="button" onClick={() => setStep(3)}>Continue <ArrowRight size={17} /></button></div>
        </section>}

        {step === 3 && <section className="wizard-panel">
          <div className="section-title"><div><span className="eyebrow">Step 03</span><h2>Choose your market area</h2><p>Set a preferred hub so nearby market activity is easier to discover.</p></div><span className="step-count">03 / 03</span></div>
          <div className="location-layout">
            <div className="location-fields"><label className="field">Delivery or pickup hub<select value={location.preferredMarket} onChange={(event) => setLocation((current) => ({ ...current, preferredMarket: event.target.value }))}><option value="">Select a hub</option>{markets.map((market) => <option key={market._id} value={market._id}>{market.name}</option>)}</select></label><label className="field">Address or market area<input value={location.address} onChange={(event) => setLocation((current) => ({ ...current, address: event.target.value }))} placeholder="Enter a location" /></label><div className="coordinate-fields"><label className="field">Latitude<input inputMode="decimal" value={location.latitude} onChange={(event) => setLocation((current) => ({ ...current, latitude: event.target.value }))} /></label><label className="field">Longitude<input inputMode="decimal" value={location.longitude} onChange={(event) => setLocation((current) => ({ ...current, longitude: event.target.value }))} /></label></div><AsyncStatus loading={marketsLoading} error={marketsError} onRetry={reloadMarkets} /></div>
            <Suspense fallback={<div className="map-placeholder" role="status">Loading map…</div>}><MapPlaceholder title="Location preview" detail="Choose a market with a saved location to preview it here." locations={markets} selectedLocationId={location.preferredMarket} onSelect={(marketId) => setLocation((current) => ({ ...current, preferredMarket: marketId }))} /></Suspense>
          </div>
          <div className="alerts-panel"><h3>Market alerts</h3><label className="switch-row"><span>Live market dispatch alerts<small>Get updates when new harvests are listed nearby.</small></span><input className="switch" type="checkbox" checked={alerts.dispatch} onChange={(event) => setAlerts((current) => ({ ...current, dispatch: event.target.checked }))} /></label><label className="switch-row"><span>Price and availability alerts<small>Stay informed when saved categories change.</small></span><input className="switch" type="checkbox" checked={alerts.price} onChange={(event) => setAlerts((current) => ({ ...current, price: event.target.checked }))} /></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <div className="registration-success" role="status"><strong>Registration received</strong><span>{success}</span><Link className="button button-primary" to="/login">Continue to sign in</Link></div>}
          {!success && <div className="form-actions"><button className="button button-light" type="button" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button><button className="button button-primary" type="button" disabled={loading} onClick={submitRegistration}>{loading ? 'Creating account…' : 'Create account'} <Check size={17} /></button></div>}
        </section>}
        <div className="register-footnote"><MapPin size={16} /> Location and interest details can be changed in your profile.</div>
      </div>
    </div>
  );
}