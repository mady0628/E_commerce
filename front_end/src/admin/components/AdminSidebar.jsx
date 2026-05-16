import { Link } from 'react-router-dom';

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'user', label: 'Users' },
  { key: 'product', label: 'Products' },
  { key: 'order', label: 'Orders' },
  { key: 'comment', label: 'Comments' },
];

function AdminSidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">AdminPanel</div>
      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => onSelectTab(item.key)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <Link to="/" className="admin-home-link">
        <span>Home</span>
      </Link>
    </aside>
  );
}

export default AdminSidebar;
