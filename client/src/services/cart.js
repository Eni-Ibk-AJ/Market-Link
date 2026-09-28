const CART_KEY = 'marketlinkCart';

export function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addCartItem(product) {
  const items = readCart();
  const existing = items.find((item) => item.product._id === product._id);
  const updated = existing
    ? items.map((item) => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...items, { product, quantity: 1 }];
  writeCart(updated);
  return updated;
}