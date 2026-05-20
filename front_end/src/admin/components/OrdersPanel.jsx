import { formatOrderDateLabel, formatVND, groupOrdersByDate } from '../adminUtils';

function OrdersPanel({
  orders,
  orderSearchTerm,
  setOrderSearchTerm,
  fetchOrders,
  handleUpdateOrderStatus,
}) {
  const groupedOrders = groupOrdersByDate(orders);

  return (
          <div className="admin-panel" key="order">
            <h2>Order History</h2>
            <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '1rem' }}>
              Track customer orders, fulfillment status, and recent transactions.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Search by ID, user, phone, address, or date..." 
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders(orderSearchTerm)}
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
                onClick={() => fetchOrders(orderSearchTerm)}
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
              {orderSearchTerm && (
                <button 
                  onClick={() => { setOrderSearchTerm(''); fetchOrders(''); }}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {groupedOrders.length === 0 && (
                <div style={{ color: '#8b8b99', textAlign: 'center', padding: '1rem 0' }}>No orders found.</div>
              )}

              {groupedOrders.map(([dateLabel, dateOrders]) => (
                <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ color: '#aa3bff', fontSize: '1.05rem', fontWeight: 700 }}>
                    {formatOrderDateLabel(dateOrders[0].createdAt)}
                  </div>

                  {dateOrders.map((order) => {
                    const totalItems = order.products?.length || 0;
                    return (
                      <div key={order._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.2rem 1.4rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr 1fr auto', gap: '1rem', alignItems: 'start' }}>
                          <div>
                            <div style={{ color: '#8b8b99', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Order ID</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all' }}>#{order._id}</div>
                          </div>
                          <div>
                            <div style={{ color: '#8b8b99', fontSize: '0.85rem', marginBottom: '0.25rem' }}>User</div>
                            <div style={{ color: '#fff' }}>{order.user?.name || 'Unknown'}</div>
                          </div>
                          <div style={{ color: '#8b8b99', fontSize: '0.85rem' }}>
                            <div><strong>Name:</strong> {order.recipientName || 'N/A'}</div>
                            <div><strong>Phone:</strong> {order.phone || 'N/A'}</div>
                            <div style={{ maxWidth: '260px', wordBreak: 'break-word', marginTop: '0.2rem' }}><strong>Addr:</strong> {order.address || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ color: '#8b8b99', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Created At</div>
                            <div style={{ color: '#fff' }}>{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</div>
                            <div style={{ color: '#8b8b99', fontSize: '0.85rem', marginTop: '0.35rem' }}>{totalItems} items ({formatVND(order.total || 0)})</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <span style={{ 
                              padding: '0.4rem 1rem', 
                              background: order.status === 'success' ? 'rgba(46, 213, 115, 0.1)' : order.status === 'cancel' ? 'rgba(255, 71, 87, 0.1)' : order.status === 'shipping' ? 'rgba(55, 162, 235, 0.1)' : 'rgba(255, 165, 2, 0.1)', 
                              color: order.status === 'success' ? '#2ed573' : order.status === 'cancel' ? '#ff4757' : order.status === 'shipping' ? '#37a2eb' : '#ffa502', 
                              borderRadius: '12px', 
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              {order.status || 'pending'}
                            </span>
                            <select 
                              value={order.status || 'pending'} 
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                color: '#fff', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                padding: '0.5rem', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                outline: 'none',
                                width: '100%'
                              }}
                            >
                              <option value="pending" style={{ background: '#1e1e2f', color: '#fff' }}>Pending</option>
                              <option value="shipping" style={{ background: '#1e1e2f', color: '#fff' }}>Shipping</option>
                              <option value="success" style={{ background: '#1e1e2f', color: '#fff' }}>Success</option>
                              <option value="cancel" style={{ background: '#1e1e2f', color: '#fff' }}>Cancel</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
}

export default OrdersPanel;
