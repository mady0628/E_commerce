import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, apiUrl } from '../utils/api';

const PRODUCT_LIMIT = 10;

// Helper function to format currency to VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StarIcon = ({ filled, half, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#ffa502' : half ? 'url(#halfGradSearch)' : 'none'}
    stroke="#ffa502"
    strokeWidth="2"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="halfGradSearch">
        <stop offset="50%" stopColor="#ffa502" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const RatingStars = ({ value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffa502', fontWeight: 600, fontSize: '0.95rem' }}>
      <span>{!value || value === 0 ? 'no rate' : `${value}⭐`}</span>
    </div>
  );
};

function SearchResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const keyword = (searchParams.get('q') || '').trim();
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async (offset = 0, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl('/api/product')}?q=${encodeURIComponent(keyword)}&sort=${sort}&productOffset=${offset}&productLimit=${PRODUCT_LIMIT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      
      if (reset) {
        setProducts(data.product || []);
      } else {
        setProducts(prev => [...prev, ...(data.product || [])]);
      }
      setPagination(data.productPagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign_in');
      return;
    }
    if (!keyword) return;
    fetchProducts(0, true);
  }, [navigate, keyword, sort]);

  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      fetchProducts(pagination.nextOffset, false);
    }
  };

  const addtoCart = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const data = await apiFetch('/api/cart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productID: id })
      });

      if (data?.products) {
        alert('Added to cart successfully!');
      } else {
        alert(data?.message || data?.error || 'Failed to add to cart');
      }
    } catch {
      alert('Cannot connect to server');
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#fff' }}>Search Results</h1>
          <p style={{ color: '#8b8b99', marginTop: '0.5rem', fontSize: '1.05rem' }}>
            Đây là kết quả của "{keyword}".
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#8b8b99', fontSize: '0.95rem' }}>Sort by:</span>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)} 
              style={{ 
                padding: '0.65rem 1rem', 
                borderRadius: '8px', 
                background: 'rgba(255,255,255,0.04)', 
                border: '1px solid rgba(255,255,255,0.15)', 
                color: '#fff', 
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest" style={{background: '#1e1e2f'}}>Newest</option>
              <option value="best_selling" style={{background: '#1e1e2f'}}>Best Selling</option>
              <option value="price_asc" style={{background: '#1e1e2f'}}>Price: Low to High</option>
              <option value="price_desc" style={{background: '#1e1e2f'}}>Price: High to Low</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.65rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Quay về trang chính
          </button>
        </div>
      </div>

      {!keyword && (
        <div style={{ textAlign: 'center', color: '#8b8b99', padding: '3rem 0' }}>
          Vui lòng nhập từ khóa để tìm kiếm.
        </div>
      )}

      {keyword && products.length === 0 && (
        <div style={{ textAlign: 'center', color: '#8b8b99', padding: '3rem 0' }}>
          Không tìm thấy sản phẩm phù hợp.
        </div>
      )}

      {keyword && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map((p) => (
            <div key={p._id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div onClick={() => navigate(`/product/${p._id}`)} style={{ height: '200px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', overflow: 'hidden' }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🛍️'
                )}
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 onClick={() => navigate(`/product/${p._id}`)} style={{ fontSize: '1.25rem', marginBottom: '0.3rem', color: '#fff', cursor: 'pointer' }}>{p.name}</h3>
                <div style={{ marginBottom: '0.8rem' }}>
                  <RatingStars value={p.rate || 0} />
                </div>
                <p style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.describe || 'No description available'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#aa3bff' }}>{formatVND(p.cost)}</span>

                  {p.stock > 0 ? (
                    <button
                      onClick={() => addtoCart(p._id)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(170,59,255,0.15)',
                        color: '#aa3bff',
                        border: '1px solid rgba(170,59,255,0.3)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => { e.target.style.background = '#aa3bff'; e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.background = 'rgba(170,59,255,0.15)'; e.target.style.color = '#aa3bff'; }}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#8b8b99',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
                <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: p.stock > 0 ? '#2ed573' : '#ff4757', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.stock > 0 ? `In Stock: ${p.stock}` : 'Currently unavailable'}</span>
                  <span style={{ color: '#6b8cff' }}>🔥 {p.purchased || 0} sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#8b8b99' }}>Loading products...</div>
      )}

      {pagination?.hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          style={{
            display: 'block',
            margin: '2rem auto 0',
            padding: '0.8rem 2.5rem',
            borderRadius: '10px',
            background: 'rgba(170,59,255,0.15)',
            color: '#aa3bff',
            border: '1px solid rgba(170,59,255,0.3)',
            fontWeight: 600,
            cursor: loadingMore ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loadingMore ? 0.6 : 1
          }}
          onMouseOver={(e) => { if (!loadingMore) { e.target.style.background = '#aa3bff'; e.target.style.color = '#fff'; } }}
          onMouseOut={(e) => { if (!loadingMore) { e.target.style.background = 'rgba(170,59,255,0.15)'; e.target.style.color = '#aa3bff'; } }}
        >
          {loadingMore ? 'Loading...' : `Load More Products (${pagination.total - products.length} remaining)`}
        </button>
      )}
    </div>
  );
}

export default SearchResult;
