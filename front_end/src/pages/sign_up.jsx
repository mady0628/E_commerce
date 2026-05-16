import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../utils/api';

function Sign_up() {
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/auth/sign_up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (data.user) {
        alert("Sign up success");
        navigate('/sign_in');
      } else {
        alert(data.message || data.error || "Sign up failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(170,59,255,0.1), transparent 40%), radial-gradient(circle at bottom right, rgba(107,140,255,0.1), transparent 40%)' }}>
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          padding: '0.65rem 1.1rem',
          color: '#fff',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'rgba(170,59,255,0.45)';
          e.currentTarget.style.background = 'rgba(170,59,255,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
      >
        Home
      </Link>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.5s ease' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Account
        </h2>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setname(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#8b8b99', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/sign_in" style={{ color: '#aa3bff', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Sign_up;
