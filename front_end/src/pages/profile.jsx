import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';

function Profile() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    nameInOrder: '',
    phoneNumber: '',
    address: '',
  });
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign_in');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok || !data.user) {
          navigate('/sign_in');
          return;
        }

        setUser(data.user);
        setAvatarPreview(data.user.avatar || '');
        setShippingInfo({
          nameInOrder: data.user.nameInOrder || '',
          phoneNumber: data.user.phoneNumber || '',
          address: data.user.address || '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const updateShippingField = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      alert('Please choose an avatar first.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    setSavingAvatar(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me/avatar'), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || 'Failed to save avatar.');
        return;
      }

      setUser(data.user);
      setAvatarFile(null);
      setAvatarPreview(data.user.avatar || '');
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('user-updated'));
      alert(data.message || 'Avatar saved.');
    } catch (err) {
      console.error(err);
      alert('Failed to save avatar.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();

    const cleanedShippingInfo = {
      nameInOrder: shippingInfo.nameInOrder.trim(),
      phoneNumber: shippingInfo.phoneNumber.trim(),
      address: shippingInfo.address.trim(),
    };

    if (!cleanedShippingInfo.nameInOrder || !cleanedShippingInfo.phoneNumber || !cleanedShippingInfo.address) {
      alert('Please fill in all shipping details.');
      return;
    }

    setSavingShipping(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me/shipping-info'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(cleanedShippingInfo),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || 'Failed to save shipping information.');
        return;
      }

      setUser(data.user);
      setShippingInfo(cleanedShippingInfo);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('user-updated'));
      alert(data.message || 'Shipping information saved.');
    } catch (err) {
      console.error(err);
      alert('Failed to save shipping information.');
    } finally {
      setSavingShipping(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const currentPassword = passwordInfo.currentPassword.trim();
    const newPassword = passwordInfo.newPassword.trim();
    const confirmPassword = passwordInfo.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me/password'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      const message = data.message || data.error || 'Failed to change password.';

      if (!res.ok || message.toLowerCase().includes('wrong') || message.toLowerCase().includes('fill')) {
        alert(message);
        return;
      }

      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert(message);
    } catch (err) {
      console.error(err);
      alert('Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const labelStyle = {
    color: '#8b8b99',
    fontSize: '0.9rem',
  };

  const navItems = [
    { key: 'profile', label: 'Profile' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'shipping', label: 'Shipping Info' },
    { key: 'password', label: 'Password' },
  ];

  const renderContent = () => {
    if (activeSection === 'avatar') {
      return (
        <section className="glass-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Avatar</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '220px' }}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                style={{ padding: '0.9rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', fontWeight: 600 }}
              >
                Choose Avatar
              </button>
              <button className="btn-primary" type="button" onClick={handleSaveAvatar} disabled={savingAvatar}>
                {savingAvatar ? 'Saving...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === 'shipping') {
      return (
        <form className="glass-card" onSubmit={handleSaveShipping}>
          <h2 style={{ marginBottom: '1.5rem' }}>Saved Shipping Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Recipient Name</label>
              <input
                className="form-input"
                value={shippingInfo.nameInOrder}
                onChange={e => updateShippingField('nameInOrder', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input
                className="form-input"
                value={shippingInfo.phoneNumber}
                onChange={e => updateShippingField('phoneNumber', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Address</label>
              <textarea
                className="form-input"
                rows="4"
                value={shippingInfo.address}
                onChange={e => updateShippingField('address', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button className="btn-primary" disabled={savingShipping} type="submit">
              {savingShipping ? 'Saving...' : 'Save Shipping Info'}
            </button>
          </div>
        </form>
      );
    }

    if (activeSection === 'password') {
      return (
        <form className="glass-card" onSubmit={handleChangePassword}>
          <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                className="form-input"
                type="password"
                value={passwordInfo.currentPassword}
                onChange={e => updatePasswordField('currentPassword', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                className="form-input"
                type="password"
                value={passwordInfo.newPassword}
                onChange={e => updatePasswordField('newPassword', e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                className="form-input"
                type="password"
                value={passwordInfo.confirmPassword}
                onChange={e => updatePasswordField('confirmPassword', e.target.value)}
              />
            </div>
            <button className="btn-primary" disabled={changingPassword} type="submit">
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      );
    }

    return (
      <section className="glass-card">
        <h2 style={{ marginBottom: '1.5rem' }}>Profile Information</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Name</label>
            <input className="form-input" value={user?.name || ''} readOnly />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input className="form-input" value={user?.email || ''} readOnly />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Role</label>
            <input className="form-input" value={user?.role || 'user'} readOnly />
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass-card">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        My Account
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <aside className="glass-card" style={{ padding: '1.2rem', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.4rem 0.4rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: '#8b8b99', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {navItems.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: '8px',
                  textAlign: 'left',
                  background: activeSection === item.key ? 'rgba(170, 59, 255, 0.15)' : 'transparent',
                  color: activeSection === item.key ? '#fff' : '#8b8b99',
                  border: activeSection === item.key ? '1px solid rgba(170, 59, 255, 0.3)' : '1px solid transparent',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Profile;
