import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function Sign_in() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('http://localhost:3000/api/auth/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        localStorage.setItem('token', res.token);
        // Dispatch custom event to notify Navbar of login (optional, a page reload or context is better, but this works for simple apps)
        navigate('/');
      } else {
        alert(res.message || "Login failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top right, rgba(170,59,255,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(107,140,255,0.1), transparent 40%)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.5s ease' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome Back
        </h2>
        
        <form onSubmit={handleSignin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#8b8b99', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/sign_up" style={{ color: '#aa3bff', fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Sign_in;