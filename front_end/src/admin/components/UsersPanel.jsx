
function UsersPanel({
  users,
  userSearchTerm,
  setUserSearchTerm,
  fetchUsers,
  handleDeleteUser,
}) {
  return (
          <div className="admin-panel" key="user">
            <h2>User Management</h2>
            <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '1rem' }}>
              View and manage registered users, their roles, and account status.
            </p>

            {/* User Search Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(userSearchTerm)}
                style={{ 
                  flex: 1, 
                  maxWidth: '400px', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => fetchUsers(userSearchTerm)}
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Search
              </button>
              {userSearchTerm && (
                <button 
                  onClick={() => { setUserSearchTerm(''); fetchUsers(''); }}
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.9'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              {users.map((user) => (
                <div key={user._id} style={{ 
                  padding: '1.2rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'transform 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #aa3bff, #6b8cff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#8b8b99', marginTop: '0.2rem' }}>{user.email} - Role: {user.role}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'rgba(255, 71, 87, 0.1)', 
                        color: '#ff4757', 
                        border: '1px solid rgba(255, 71, 87, 0.3)',
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(255, 71, 87, 0.2)'}
                      onMouseOut={(e) => e.target.style.background = 'rgba(255, 71, 87, 0.1)'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <div style={{ color: '#8b8b99' }}>No users found.</div>}
            </div>
          </div>
        );
}

export default UsersPanel;
