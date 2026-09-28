import { CircleAlert, LoaderCircle } from 'lucide-react';

export default function AsyncStatus({ loading, error, onRetry }) {
  if (loading) return <div className="async-status" role="status"><LoaderCircle className="loading-icon" size={18} /> Loading MarketLink data…</div>;
  if (error) return <div className="async-error" role="alert"><CircleAlert size={18} /><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Retry</button>}</div>;
  return null;
}