import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

// Helper function to format currency to VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Order() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign_in");
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await apiFetch("/api/order", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [navigate]);

  if (!orders.length) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Orders Yet</h2>
        <p style={{ color: '#8b8b99', marginBottom: '2rem' }}>When you place an order, it will appear here.</p>
        <Link 
          to="/"
          className="btn-primary" 
          style={{ width: 'auto', padding: '0.8rem 2rem', textDecoration: 'none', display: 'inline-block' }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return { bg: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' };
      case 'cancel': return { bg: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' };
      case 'shipping': return { bg: 'rgba(55, 162, 235, 0.1)', color: '#37a2eb' };
      default: return { bg: 'rgba(255, 165, 2, 0.1)', color: '#ffa502' };
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Order History
          </h1>
          <p style={{ color: '#8b8b99', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Track and view your past purchases
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {orders.map((order, index) => {
          const statusStyle = getStatusColor(order.status || 'pending');
          const totalCost = (order.products || []).reduce((sum, item) => sum + (item.product?.cost || 0) * (item.quantity || 0), 0);
          
          return (
            <div key={order._id || index} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Order Header */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Order ID</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>#{order._id?.substring(0, 8) || `ORD-${index}`}</div>
                </div>
                
                <div>
                  <div style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Total Amount</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#aa3bff' }}>{formatVND(totalCost)}</div>
                </div>

                <div>
                  <div style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Status</div>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    background: statusStyle.bg, 
                    color: statusStyle.color, 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    display: 'inline-block'
                  }}>
                    {order.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ padding: '2rem' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Items Ordered</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {(order.products || []).map((item, itemIndex) => (
                    <div key={item.product?._id || itemIndex} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '🛍️'
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: '#fff' }}>{item.product?.name || 'Unknown Item'}</div>
                        <div style={{ color: '#8b8b99', fontSize: '0.9rem' }}>Qty: {item.quantity} × {formatVND(item.product?.cost || 0)}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {formatVND((item.product?.cost || 0) * (item.quantity || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Order;
