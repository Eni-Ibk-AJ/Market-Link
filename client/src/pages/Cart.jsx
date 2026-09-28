import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Minus, PackageOpen, Plus, Star, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api, getApiErrorMessage } from '../services/api';
import { readCart, writeCart } from '../services/cart';
import '../components/Common.css';
import './Cart.css';

export default function Cart() {
  const { records: orders, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useApiCollection(api.orders.customer);
  const { records: markets, loading: marketsLoading, error: marketsError } = useApiCollection(api.markets.list);
  const [cartItems, setCartItems] = useState(readCart);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewFarmerId, setReviewFarmerId] = useState('');
  const [pickup, setPickup] = useState({ marketId: '', date: '', time: '' });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { document.title = 'Cart & orders | MarketLink'; }, []);

  function updateQuantity(productId, delta) {
    const updated = cartItems.map((item) => item.product._id === productId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0);
    setCartItems(updated);
    writeCart(updated);
  }

  async function submitOrder() {
    setError('');
    setNotice('');
    const farmerId = cartItems[0]?.product?.farmer?._id || cartItems[0]?.product?.farmer;
    const hasOneFarmer = cartItems.every((item) => (item.product?.farmer?._id || item.product?.farmer) === farmerId);
    if (!farmerId || !hasOneFarmer) {
      setError('Place one pre-order per farmer. Remove items from other farmers before checkout.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const response = await api.orders.create({
        farmerId,
        marketId: pickup.marketId,
        items: cartItems.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
        pickupDate: pickup.date,
        pickupTimeSlot: pickup.time,
      });
      const updated = [];
      setCartItems(updated);
      writeCart(updated);
      setNotice(response.message);
      reloadOrders();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to place the pre-order.'));
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function submitReview() {
    setError('');
    setNotice('');
    setSubmittingReview(true);
    try {
      const response = await api.reviews.create({ farmerId: reviewFarmerId, rating, comment: review });
      setReview('');
      setRating(0);
      setNotice(response.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to submit your review.'));
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="page-shell cart-page">
      <div className="content-width">
        <header className="page-intro"><div><span className="eyebrow">Your MarketLink</span><h1>Pre-orders & activity</h1><p>Manage your basket, collection details, and order history.</p></div></header>
        {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}
        <div className="cart-columns">
          <section className="cart-main-column">
            <article className="cart-section panel"><div className="section-title"><h2>Basket</h2><span>{cartItems.length} products</span></div>{cartItems.length === 0 ? <EmptyState title="Your basket is empty" detail="Add harvest listings from the marketplace to start a pre-order." icon={PackageOpen} /> : <div className="basket-list">{cartItems.map(({ product, quantity }) => <div className="basket-item" key={product._id}><div><strong>{product.name}</strong><span>{product.farmer?.farmerProfile?.stallName || `${product.farmer?.firstName || ''} ${product.farmer?.lastName || ''}`}</span><small>{product.price} / {product.unit}</small></div><div className="quantity-controls"><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateQuantity(product._id, -1)}><Minus size={14} /></button><span>{quantity}</span><button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateQuantity(product._id, 1)}><Plus size={14} /></button><button type="button" aria-label={`Remove ${product.name}`} onClick={() => updateQuantity(product._id, -quantity)}><Trash2 size={15} /></button></div></div>)}</div>}<div className="pickup-fields"><label className="field"><span>Pickup market</span><select value={pickup.marketId} onChange={(event) => setPickup((current) => ({ ...current, marketId: event.target.value }))}><option value="">Select a market</option>{markets.map((market) => <option key={market._id} value={market._id}>{market.name}</option>)}</select></label><label className="field"><span><CalendarDays size={15} /> Pickup date</span><input type="date" value={pickup.date} onChange={(event) => setPickup((current) => ({ ...current, date: event.target.value }))} /></label><label className="field"><span><Clock3 size={15} /> Pickup time slot</span><input value={pickup.time} onChange={(event) => setPickup((current) => ({ ...current, time: event.target.value }))} placeholder="e.g. 09:00 AM - 10:00 AM" /></label></div><AsyncStatus loading={marketsLoading} error={marketsError} /><button className="button button-primary checkout-button" type="button" disabled={!cartItems.length || !pickup.marketId || !pickup.date || !pickup.time || submittingOrder} onClick={submitOrder}>{submittingOrder ? 'Placing pre-order…' : 'Place pre-order'}</button></article>
            <article className="cart-section panel"><div className="section-title"><h2>Order status & history</h2><span>{orders.length} total</span></div><AsyncStatus loading={ordersLoading} error={ordersError} onRetry={reloadOrders} />{!ordersLoading && !ordersError && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Market / farmer</th><th>Pickup</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>{order._id.slice(-7)}</td><td>{order.market?.name || order.farmer?.farmerProfile?.stallName || `${order.farmer?.firstName || ''} ${order.farmer?.lastName || ''}`}</td><td>{new Date(order.pickupDate).toLocaleDateString()} · {order.pickupTimeSlot}</td><td>{order.status}</td><td>{order.totalAmount}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="blank-table-note">No active orders</div>}</div>}</article>
          </section>
          <aside className="cart-side-column">
            <section className="review-card panel"><span className="eyebrow">Your feedback</span><h2>Leave a review</h2><p>Share a note about a farmer you have visited.</p><label className="field">Farmer ID<input value={reviewFarmerId} onChange={(event) => setReviewFarmerId(event.target.value)} placeholder="Farmer account ID" /></label><div className="rating-stars" role="group" aria-label="Choose a star rating">{[1, 2, 3, 4, 5].map((value) => <button type="button" aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={rating === value} onClick={() => setRating(value)} key={value}><Star size={21} fill={rating >= value ? 'currentColor' : 'none'} /></button>)}</div><label className="field">Comment<textarea placeholder="Write your review" value={review} onChange={(event) => setReview(event.target.value)} /></label><button className="button button-primary review-submit" type="button" disabled={!reviewFarmerId || !rating || !review.trim() || submittingReview} onClick={submitReview}>{submittingReview ? 'Submitting…' : 'Submit review'}</button></section>
            <section className="saved-farmers panel"><h2>Saved farmers</h2><EmptyState title="No saved farmers yet" detail="Farmers you save will appear here." icon={Star} /></section>
          </aside>
        </div>
      </div>
    </div>
  );
}