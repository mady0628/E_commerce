import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiUrl } from '../utils/api';

const getStoredUser = () => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (!token) return;

    fetch(apiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(err => console.error(err));
  }, [token, location.pathname]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('user-updated', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('user-updated', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  if (location.pathname === '/sign_in' || location.pathname === '/sign_up') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
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

  const avatarStyle = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #aa3bff, #6b8cff)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    flexShrink: 0,
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        <Link to="/">MTD Store</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ ...linkStyle, color: location.pathname === '/' ? '#fff' : '#8b8b99' }}>Home</Link>
        {token && (
          <>
            <Link to="/cart" style={{ ...linkStyle, color: location.pathname === '/cart' ? '#fff' : '#8b8b99' }}>Cart</Link>
            <Link to="/order" style={{ ...linkStyle, color: location.pathname === '/order' ? '#fff' : '#8b8b99' }}>Orders</Link>
            <Link to="/profile" style={{ ...linkStyle, color: location.pathname === '/profile' ? '#fff' : '#8b8b99' }}>My Account</Link>
          </>
        )}

        {token && user?.role === 'admin' && (
          <Link to="/admin" style={{ ...linkStyle, color: '#aa3bff' }}>Admin Panel</Link>
        )}

        {token ? (
          <>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginRight: '1rem',
                color: '#fff',
                maxWidth: 180,
              }}
            >
              <span style={avatarStyle}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Account'}
              </span>
            </Link>
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
          </>
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
