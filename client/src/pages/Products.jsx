import { useCallback, useEffect, useState } from 'react';
import { ArrowDownUp, Check, PackageSearch, Search, ShoppingBasket, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import AsyncStatus from '../components/AsyncStatus';
import useApiCollection from '../hooks/useApiCollection';
import { api } from '../services/api';
import { addCartItem } from '../services/cart';
import '../components/Common.css';
import './Products.css';

const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Baked Goods', 'Meat & Poultry', 'Herbs & Spices', 'Others'];
export default function Products() {
  const [searchParams] = useSearchParams();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [sort, setSort] = useState('recent');
  const [addedId, setAddedId] = useState('');
  const loadProducts = useCallback(() => api.products.list({
    ...(category !== 'All' && { category }),
    ...(query && { search: query }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  }), [category, query, minPrice, maxPrice]);
  const { records: products, loading, error, reload } = useApiCollection(loadProducts);
  const sortedProducts = [...products].sort((first, second) => sort === 'price-low' ? first.price - second.price : sort === 'price-high' ? second.price - first.price : new Date(second.createdAt) - new Date(first.createdAt));

  useEffect(() => { document.title = 'Harvest | MarketLink'; }, []);

  return (
    <div className="page-shell products-page">
      <div className="content-width">
        <header className="page-intro"><div><span className="eyebrow">Weekly availability</span><h1>Explore the harvest</h1><p>Browse current listings from farms and markets in your area.</p></div><span className="inventory-count">{products.length} listings</span></header>
        <div className="products-toolbar panel"><div className="product-search"><Search size={17} /><input aria-label="Search harvest" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the harvest" /></div><div className="sort-control"><ArrowDownUp size={15} /><select aria-label="Sort harvest" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Recently listed</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div><SlidersHorizontal className="mobile-filter-icon" size={19} /></div>
        <div className="product-layout">
          <aside className="product-sidebar panel"><h2>Categories</h2><div className="category-list">{categories.map((item) => <button type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}<span>{item === 'All' ? products.length : ''}</span></button>)}</div><div className="filter-group price-filter"><h3>Price range</h3><div className="price-inputs"><label className="sr-only" htmlFor="min-price">Minimum price</label><input id="min-price" inputMode="decimal" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min" /><span>to</span><label className="sr-only" htmlFor="max-price">Maximum price</label><input id="max-price" inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max" /></div></div><div className="filter-group"><h3>Availability</h3><span className="filter-check">Only available listings are shown</span></div></aside>
          <section className="product-results"><div className="results-header"><div><h2>{category === 'All' ? 'All harvests' : category}</h2><span>{products.length} listings from the MarketLink network</span></div></div><AsyncStatus loading={loading} error={error} onRetry={reload} /><div className="product-grid">{!loading && !error && (sortedProducts.length ? sortedProducts.map((product) => <article className="product-card panel" key={product._id}>{product.imageUrl && <img src={product.imageUrl} alt={product.name} />}<div className="product-card-copy"><span>{product.category}</span><h3>{product.name}</h3><p>{product.farmer?.farmerProfile?.stallName || `${product.farmer?.firstName || ''} ${product.farmer?.lastName || ''}`}</p><strong>{product.price} / {product.unit}</strong><button className="button button-light" type="button" onClick={() => { addCartItem(product); setAddedId(product._id); }}><ShoppingBasket size={16} /> {addedId === product._id ? <><Check size={15} /> Added</> : 'Add to basket'}</button></div></article>) : <EmptyState className="product-empty" title="No products listed yet" detail="Try another category or check back when new harvests are shared." icon={PackageSearch} />)}</div></section>
        </div>
      </div>
    </div>
  );
}