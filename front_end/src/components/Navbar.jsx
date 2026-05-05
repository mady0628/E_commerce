import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Optional: fetch user data to check if admin
      fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(err => console.error(err));
    }
  }, [token]);

  // Don't show navbar on login/register pages
  if (location.pathname === '/sign_in' || location.pathname === '/sign_up') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/sign_in');
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 4rem',
    background: 'rgba(15, 15, 19, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const linkStyle = {
    color: '#8b8b99',
    fontWeight: 500,
    marginRight: '2rem',
    transition: 'color 0.3s',
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        <Link to="/">LumiStore</Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ ...linkStyle, color: location.pathname === '/' ? '#fff' : '#8b8b99' }}>Home</Link>
        <Link to="/cart" style={{ ...linkStyle, color: location.pathname === '/cart' ? '#fff' : '#8b8b99' }}>Cart</Link>
        <Link to="/order" style={{ ...linkStyle, color: location.pathname === '/order' ? '#fff' : '#8b8b99' }}>Orders</Link>
        
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ ...linkStyle, color: '#aa3bff' }}>Admin Panel</Link>
        )}

        {token ? (
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: 'rgba(255, 71, 87, 0.1)', 
              color: '#ff4757', 
              borderRadius: '8px',
              border: '1px solid rgba(255,71,87,0.3)',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        ) : (
          <Link 
            to="/sign_in"
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', 
              color: '#fff', 
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
