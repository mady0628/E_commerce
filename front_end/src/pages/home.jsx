import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function Home() {
  const [products, setproducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign_in');
      return;
    }
    fetch('http://localhost:3000/api/product', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => setproducts(data.product || []))
  }, [navigate])

  const addtoCart = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const data = await apiFetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productID: id })
      });

      if (data?.products) {
        alert("Added to cart successfully!");
      } else {
        alert(data?.message || data?.error || 'Failed to add to cart');
      }
    } catch {
      alert('Cannot connect to server');
    }
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Discover Products
          </h1>
          <p style={{ color: '#8b8b99', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Find the best items for your needs
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {products.map((p) => (
          <div key={p._id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', overflow: 'hidden' }}>
              {p.image ? (
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '🛍️'
              )}
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>{p.name}</h3>
              <p style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.describe || 'No description available'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#aa3bff' }}>${p.cost}</span>
                
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
              <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: p.stock > 0 ? '#2ed573' : '#ff4757', fontWeight: 600 }}>
                {p.stock > 0 ? `In Stock: ${p.stock}` : 'Currently unavailable'}
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#8b8b99', fontSize: '1.2rem' }}>
            No products available at the moment.
          </div>
        )}
      </div>
    </div>
  )
}

export default Home;