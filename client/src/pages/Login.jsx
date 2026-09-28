import { useState } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardPath, useAuth } from '../context/useAuth';
import { api, getApiErrorMessage } from '../services/api';
import './Login.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.auth.login(credentials);
      login(data);
      navigate(getDashboardPath(data.user.role));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-image" role="img" aria-label="Produce displayed at a neighborhood market"><span><Leaf size={17} /> MarketLink</span></div>
      <section className="login-form-side"><div className="login-form-wrap"><span className="eyebrow">Welcome back</span><h1>Sign in to your market.</h1><p>Pick up where your local sourcing left off.</p><form onSubmit={handleSubmit}><label className="field">Email address<input type="email" autoComplete="email" value={credentials.email} onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required /></label><label className="field">Password<input type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} placeholder="Enter your password" required /></label><div className="login-options"><label><input type="checkbox" /> Remember me</label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button></form><div className="login-divider"><span>New to MarketLink?</span></div><Link className="button button-light register-link" to="/register">Create an account</Link></div></section>
    </div>
  );
}