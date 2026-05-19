import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiUrl } from "../utils/api";

// Helper function to format currency to VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Cart() {
  const [cart, setcart] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ recipientName: '', phone: '', address: '' });
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [isSavingShippingInfo, setIsSavingShippingInfo] = useState(false);
  const [shippingInfoSaved, setShippingInfoSaved] = useState(false);
  const navigation = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigation("/sign_in");
      return;
    }

    const fetchCart = async () => {
      try {
        const data = await apiFetch("/api/cart", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        setcart(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUserShippingInfo = async () => {
      try {
        const data = await apiFetch("/api/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = data?.user;
        const savedShippingInfo = {
          recipientName: user?.nameInOrder || '',
          phone: user?.phoneNumber || '',
          address: user?.address || '',
        };

        if (savedShippingInfo.recipientName || savedShippingInfo.phone || savedShippingInfo.address) {
          setShippingInfo(savedShippingInfo);
          setShippingInfoSaved(Boolean(
            savedShippingInfo.recipientName &&
            savedShippingInfo.phone &&
            savedShippingInfo.address
          ));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCart();
    fetchUserShippingInfo();
  }, [navigation]);

  const updateShippingField = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    setShippingInfoSaved(false);
  };

  const handleSaveShippingInfo = async () => {
    const cleanedShippingInfo = {
      recipientName: shippingInfo.recipientName.trim(),
      phone: shippingInfo.phone.trim(),
      address: shippingInfo.address.trim(),
    };

    if (!cleanedShippingInfo.recipientName || !cleanedShippingInfo.phone || !cleanedShippingInfo.address) {
      alert("Please fill in all shipping details before saving.");
      return;
    }

    const token = localStorage.getItem("token");
    setIsSavingShippingInfo(true);

    try {
      const res = await fetch(apiUrl("/api/auth/me/shipping-info"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nameInOrder: cleanedShippingInfo.recipientName,
          phoneNumber: cleanedShippingInfo.phone,
          address: cleanedShippingInfo.address
        })
      });
      const data = await res.json();

      if (res.ok) {
        setShippingInfo(cleanedShippingInfo);
        setShippingInfoSaved(true);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        alert("Shipping information saved.");
      } else {
        alert(data.message || "Failed to save shipping information.");
      }
    } catch {
      alert("Failed to save shipping information.");
    } finally {
      setIsSavingShippingInfo(false);
    }
  };

  const updateQuantity = async (productID, newQuantity) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(apiUrl("/api/cart/item"), {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productID, quantity: newQuantity })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update quantity");
      } else {
        setcart(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    if (!showShippingForm) {
      setShowShippingForm(true);
      return;
    }

    const cleanedShippingInfo = {
      recipientName: shippingInfo.recipientName.trim(),
      phone: shippingInfo.phone.trim(),
      address: shippingInfo.address.trim(),
    };

    if (!cleanedShippingInfo.recipientName || !cleanedShippingInfo.phone || !cleanedShippingInfo.address) {
      alert("Please fill in all shipping details.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(apiUrl("/api/order"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          selectedItemIds: selectedItems,
          shippingInfo: cleanedShippingInfo
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Order placed successfully!");
        navigation("/order");
      } else {
        alert(data.message || "Failed to checkout. Please try again.");
      }
    } catch {
      alert("Failed to checkout. Please try again.");
    }
  };

  if (!cart?.products?.length) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: '#8b8b99', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <button 
          onClick={() => navigation('/')}
          className="btn-primary" 
          style={{ width: 'auto', padding: '0.8rem 2rem' }}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const selectedProducts = (cart.products || []).filter(item => selectedItems.includes(item.product?._id));
  const total = selectedProducts.reduce((sum, item) => {
    const cost = item.product?.cost || 0;
    const qnt = item.quantity || 0;
    return sum + cost * qnt;
  }, 0);

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Shopping Cart
      </h1>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Cart Items List */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.products.map((item) => (
            <div key={item.product?._id} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1.5rem', opacity: selectedItems.includes(item.product?._id) ? 1 : 0.7 }}>
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.product?._id)}
                onChange={() => toggleSelect(item.product?._id)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
                {item.product?.image ? (
                  <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  ''
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{item.product?.name || 'Unknown Product'}</h3>
                <p style={{ color: '#8b8b99', margin: 0 }}>Price: <span style={{ color: '#aa3bff', fontWeight: 600 }}>{formatVND(item.product?.cost)}</span></p>
              </div>

              <div style={{ textAlign: 'center', padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ color: '#8b8b99', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Qty</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '8px' }}>
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}
                  >-</button>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</div>
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}
                  >+</button>
                </div>
              </div>

              <div style={{ textAlign: 'right', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px' }}>
                <div>
                  <p style={{ color: '#8b8b99', fontSize: '0.9rem', margin: '0 0 0.3rem 0' }}>Total</p>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                    {formatVND((item.product?.cost || 0) * (item.quantity || 0))}
                  </div>
                </div>
                <button 
                  onClick={() => updateQuantity(item.product._id, 0)}
                  style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
                  title="Remove from cart"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="glass-card" style={{ flex: '0 1 350px', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            Order Summary
          </h2>
          
          {!showShippingForm ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#8b8b99' }}>
                <span>Selected Items ({selectedItems.length})</span>
                <span>{formatVND(total)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#8b8b99' }}>
                <span>Shipping</span>
                <span style={{ color: '#2ed573' }}>Free</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#aa3bff' }}>{formatVND(total)}</span>
              </div>
              
              <button 
                onClick={handleCheckout} 
                className="btn-primary" 
                style={{ padding: '1.2rem', fontSize: '1.1rem', opacity: selectedItems.length ? 1 : 0.5 }}
                disabled={!selectedItems.length}
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Recipient Name</label>
                <input 
                  type="text" 
                  value={shippingInfo.recipientName}
                  onChange={e => updateShippingField('recipientName', e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={shippingInfo.phone}
                  onChange={e => updateShippingField('phone', e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b8b99', fontSize: '0.9rem' }}>Delivery Address</label>
                <textarea 
                  value={shippingInfo.address}
                  onChange={e => updateShippingField('address', e.target.value)}
                  required
                  rows="3"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                />
              </div>
              <button
                type="button"
                onClick={handleSaveShippingInfo}
                disabled={isSavingShippingInfo}
                style={{ padding: '0.9rem', background: shippingInfoSaved ? 'rgba(46, 213, 115, 0.14)' : 'rgba(255,255,255,0.08)', border: `1px solid ${shippingInfoSaved ? 'rgba(46, 213, 115, 0.5)' : 'rgba(255,255,255,0.18)'}`, color: shippingInfoSaved ? '#2ed573' : '#fff', borderRadius: '8px', cursor: isSavingShippingInfo ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {isSavingShippingInfo ? 'Saving...' : shippingInfoSaved ? 'Shipping Info Saved' : 'Save Shipping Info'}
              </button>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowShippingForm(false)}
                  style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 2, padding: '1rem' }}
                >
                  Confirm Order ({formatVND(total)})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
