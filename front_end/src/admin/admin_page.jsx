import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './admin_page.css';
import SalesDashboard from '../components/SalesDashboard';
import { apiUrl } from '../utils/api';

// Helper function to format currency to VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatOrderDateLabel = (dateValue) => {
  return `Ngày ${new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))}`;
};

const getOrderDateKey = (dateValue) => {
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
};

const groupOrdersByDate = (orders = []) => {
  const groups = orders.reduce((acc, order) => {
    if (!order.createdAt) {
      return acc;
    }

    const key = getOrderDateKey(order.createdAt);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(order);
    return acc;
  }, {});

  return Object.entries(groups).sort((a, b) => {
    const dateA = a[1][0]?.createdAt ? new Date(a[1][0].createdAt).getTime() : 0;
    const dateB = b[1][0]?.createdAt ? new Date(b[1][0].createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const adminContentRef = useRef(null);
  
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [comments, setComments] = useState([]);
  const [selectedProductForComments, setSelectedProductForComments] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: '', cost: '', describe: '', images: [], keepImages: [], stock: '' });
  const [editingProductId, setEditingProductId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchUsers = async (query = '') => {
    try {
      const url = query 
        ? `${apiUrl('/api/auth/users')}?q=${encodeURIComponent(query)}`
        : apiUrl('/api/auth/users');
      const res = await fetch(url, { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const [productPagination, setProductPagination] = useState(null);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const fetchProducts = async (offset = 0, reset = true, query = productSearchTerm) => {
    try {
      if (!reset) setLoadingMoreProducts(true);
      const res = await fetch(`${apiUrl('/api/product')}?productOffset=${offset}&productLimit=10&q=${encodeURIComponent(query)}`, { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.product) {
        if (reset) {
          setProducts(data.product);
        } else {
          setProducts(prev => [...prev, ...data.product]);
        }
        setProductPagination(data.productPagination || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreProducts(false);
    }
  };

  const handleLoadMoreProducts = () => {
    if (productPagination?.hasMore) {
      fetchProducts(productPagination.nextOffset, false);
    }
  };

  const fetchOrders = async (query = '') => {
    try {
      const url = query 
        ? `${apiUrl('/api/orders')}?q=${encodeURIComponent(query)}` 
        : apiUrl('/api/orders');

      const res = await fetch(url, { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${apiUrl('/api/auth/users')}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('cost', newProduct.cost);
      formData.append('describe', newProduct.describe);
      formData.append('stock', newProduct.stock);

      // Append từng ảnh mới vào field 'images'
      newProduct.images.forEach(file => formData.append('images', file));

      // Khi edit: gửi danh sách ảnh cũ muốn giữ (dưới dạng JSON)
      if (editingProductId) {
        formData.append('keepImages', JSON.stringify(newProduct.keepImages));
      }

      const url = editingProductId 
        ? `${apiUrl('/api/product')}/${editingProductId}`
        : apiUrl('/api/product');
        
      const method = editingProductId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setNewProduct({ name: '', cost: '', describe: '', images: [], keepImages: [], stock: '' });
        setEditingProductId(null);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || data.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      cost: product.cost,
      describe: product.describe,
      images: [],                                          // chưa chọn file mới
      keepImages: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
      stock: product.stock !== undefined ? product.stock : ''
    });
    setEditingProductId(product._id);
    adminContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewProduct({ name: '', cost: '', describe: '', images: [], keepImages: [], stock: '' });
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${apiUrl('/api/product')}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiUrl('/api/orders')}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCommentsByProduct = async (productId) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${apiUrl('/api/admin/product')}/${productId}/comments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.comment) setComments(data.comment);
      else setComments([]);
    } catch (err) {
      console.error(err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSelectProductForComments = (product) => {
    setSelectedProductForComments(product);
    fetchCommentsByProduct(product._id);
  };

  const handleBackToProductList = () => {
    setSelectedProductForComments(null);
    setComments([]);
  };

  const handleToggleCommentVisibility = async (commentId, currentHidden) => {
    const newStatus = currentHidden ? 'Visible' : 'Hidden';
    try {
      const res = await fetch(`${apiUrl('/api/admin/comments')}/${commentId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchCommentsByProduct(selectedProductForComments._id);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update comment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#ffa502' : 'rgba(255,255,255,0.15)', fontSize: '1.1rem' }}>
        ★
      </span>
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="admin-panel" key="dashboard">
            <SalesDashboard orders={orders} />
          </div>
        );
      case 'user':
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
      case 'product':
        return (
          <div className="admin-panel" key="product">
            <h2>Product Catalog</h2>
            <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '1rem' }}>
              Manage your store products, inventory, pricing, and categories.
            </p>

            {/* Product Search Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Search products by name or description..." 
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts(0, true, productSearchTerm)}
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
                onClick={() => fetchProducts(0, true, productSearchTerm)}
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
              {productSearchTerm && (
                <button 
                  onClick={() => { setProductSearchTerm(''); fetchProducts(0, true, ''); }}
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
            
            <div style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSaveProduct} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  required
                  style={{ flex: 1, minWidth: '200px', padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={newProduct.cost}
                  min="0"
                  onChange={e => setNewProduct({...newProduct, cost: e.target.value})}
                  required
                  style={{ width: '120px', padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <input 
                  type="number" 
                  placeholder="Stock" 
                  value={newProduct.stock}
                  onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  required
                  style={{ width: '100px', padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <input 
                  type="text" 
                  placeholder="Description" 
                  value={newProduct.describe}
                  onChange={e => setNewProduct({...newProduct, describe: e.target.value})}
                  style={{ flex: 2, minWidth: '250px', padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Ảnh cũ đang giữ lại (chỉ hiện khi edit) */}
                  {editingProductId && newProduct.keepImages.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#8b8b99', marginBottom: '0.4rem' }}>Current images (click × to remove):</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {newProduct.keepImages.map((url, i) => (
                          <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                            <img src={url} alt={`img-${i}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }} />
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, keepImages: newProduct.keepImages.filter((_, idx) => idx !== i) })}
                              style={{ position: 'absolute', top: -6, right: -6, background: '#ff4757', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: '0.75rem', cursor: 'pointer', lineHeight: '20px', textAlign: 'center', padding: 0 }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input chọn ảnh mới */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => setNewProduct({ ...newProduct, images: Array.from(e.target.files) })}
                      style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '100%', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#8b8b99', marginTop: '0.25rem', display: 'block' }}>Tối đa 5 ảnh, mỗi ảnh ≤ 5MB</span>
                  </div>

                  {/* Preview ảnh mới chọn */}
                  {newProduct.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {newProduct.images.map((file, i) => (
                        <img key={i} src={URL.createObjectURL(file)} alt={`new-${i}`}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid #aa3bff' }} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingProductId && (
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #aa3bff, #6b8cff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    {editingProductId ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {products.map((product) => (
                <div key={product._id} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ height: '140px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b8cff', fontSize: '3rem', overflow: 'hidden', position: 'relative' }}>
                    {product.image && (Array.isArray(product.image) ? product.image[0] : product.image) ? (
                      <>
                        <img
                          src={Array.isArray(product.image) ? product.image[0] : product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {Array.isArray(product.image) && product.image.length > 1 && (
                          <span style={{
                            position: 'absolute', bottom: 6, right: 8,
                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                            fontSize: '0.75rem', fontWeight: 600,
                            padding: '2px 7px', borderRadius: 20
                          }}>+{product.image.length - 1}</span>
                        )}
                      </>
                    ) : (
                      '🛍️'
                    )}
                  </div>
                    <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{product.name}</div>
                    <div style={{ color: '#8b8b99', fontSize: '0.9rem', marginBottom: '0.5rem', height: '40px', overflow: 'hidden' }}>{product.describe || 'No description available.'}</div>
                    <div style={{ color: '#aa3bff', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.8rem' }}>{formatVND(product.cost)}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: product.stock > 0 ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)', color: product.stock > 0 ? '#2ed573' : '#ff4757', fontWeight: 600 }}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                        </div>
                        <div style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(107, 140, 255, 0.1)', color: '#6b8cff', fontWeight: 600 }}>
                          Sold: {product.purchased || 0}
                        </div>
                      </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(170, 59, 255, 0.1)', color: '#aa3bff', border: '1px solid rgba(170, 59, 255, 0.3)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(170, 59, 255, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(170, 59, 255, 0.1)'}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 71, 87, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 71, 87, 0.1)'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div style={{ color: '#8b8b99', gridColumn: '1 / -1' }}>No products found.</div>}
            </div>

            {productPagination?.hasMore && (
              <button
                onClick={handleLoadMoreProducts}
                disabled={loadingMoreProducts}
                style={{
                  display: 'block',
                  margin: '2rem auto 0',
                  padding: '0.8rem 2.5rem',
                  borderRadius: '10px',
                  background: 'rgba(170,59,255,0.15)',
                  color: '#aa3bff',
                  border: '1px solid rgba(170,59,255,0.3)',
                  fontWeight: 600,
                  cursor: loadingMoreProducts ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loadingMoreProducts ? 0.6 : 1
                }}
                onMouseOver={(e) => { if (!loadingMoreProducts) { e.target.style.background = '#aa3bff'; e.target.style.color = '#fff'; } }}
                onMouseOut={(e) => { if (!loadingMoreProducts) { e.target.style.background = 'rgba(170,59,255,0.15)'; e.target.style.color = '#aa3bff'; } }}
              >
                {loadingMoreProducts ? 'Loading...' : `Load More Products (${productPagination.total - products.length} remaining)`}
              </button>
            )}
          </div>
        );
      case 'order':
        const groupedOrders = groupOrdersByDate(orders);
        return (
          <div className="admin-panel" key="order">
            <h2>Order History</h2>
            <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '1rem' }}>
              Track customer orders, fulfillment status, and recent transactions.
            </p>

            {/* Search Input */}
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
      case 'comment':
        return (
          <div className="admin-panel" key="comment">
            {!selectedProductForComments ? (
              /* ── Product List View ── */
              <>
                <h2>💬 Comment Management</h2>
                <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '2rem' }}>
                  Select a product to view and manage its customer reviews.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSelectProductForComments(product)}
                      className="comment-product-card"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        overflow: 'hidden',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(170,59,255,0.4)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(170,59,255,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ height: '120px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '2.5rem' }}>🛍️</span>
                        )}
                      </div>
                      <div style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{product.name}</div>
                        <div style={{ color: '#8b8b99', fontSize: '0.85rem' }}>{formatVND(product.cost)}</div>
                        <div style={{
                          marginTop: '0.7rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '20px',
                          background: 'rgba(170,59,255,0.1)',
                          color: '#c084fc',
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}>
                          💬 View Comments
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && <div style={{ color: '#8b8b99', gridColumn: '1 / -1' }}>No products found.</div>}
                </div>
              </>
            ) : (
              /* ── Comment Detail View ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={handleBackToProductList}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#c084fc',
                      border: '1px solid rgba(170,59,255,0.25)',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.9rem'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(170,59,255,0.15)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                  >
                    ← Back
                  </button>
                  <h2 style={{ margin: 0 }}>Comments</h2>
                </div>

                {/* Product info banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '1rem 1.5rem',
                  marginBottom: '2rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedProductForComments.image ? (
                      <img src={selectedProductForComments.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.15rem' }}>{selectedProductForComments.name}</div>
                    <div style={{ color: '#8b8b99', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      {formatVND(selectedProductForComments.cost)} · {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {loadingComments ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8b8b99' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#8b8b99',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>💭</div>
                    No comments yet for this product.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        style={{
                          padding: '1.3rem 1.5rem',
                          background: comment.isHidden ? 'rgba(255,71,87,0.04)' : 'rgba(255,255,255,0.03)',
                          borderRadius: '16px',
                          border: comment.isHidden
                            ? '1px solid rgba(255,71,87,0.15)'
                            : '1px solid rgba(255,255,255,0.06)',
                          transition: 'all 0.3s',
                          opacity: comment.isHidden ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                          {/* Left: user + rating + content */}
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6b8cff, #aa3bff)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                flexShrink: 0
                              }}>
                                {comment.user?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                  {comment.user?.name || 'Unknown User'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                                  <span>{renderStars(comment.rating)}</span>
                                  <span style={{ color: '#8b8b99', fontSize: '0.8rem' }}>
                                    {new Date(comment.createAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p style={{
                              margin: '0.6rem 0 0 0',
                              color: '#d1d1db',
                              fontSize: '0.95rem',
                              lineHeight: 1.6,
                              paddingLeft: '2.8rem'
                            }}>
                              {comment.content || <em style={{ color: '#6b6b7b' }}>No text content</em>}
                            </p>
                            {comment.isHidden && (
                              <div style={{
                                marginTop: '0.5rem',
                                paddingLeft: '2.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '8px',
                                background: 'rgba(255,71,87,0.1)',
                                color: '#ff6b7a',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                marginLeft: '2.8rem'
                              }}>
                                🚫 Hidden
                              </div>
                            )}
                          </div>

                          {/* Right: toggle button */}
                          <button
                            onClick={() => handleToggleCommentVisibility(comment._id, comment.isHidden)}
                            style={{
                              padding: '0.5rem 1.2rem',
                              background: comment.isHidden
                                ? 'rgba(46,213,115,0.1)'
                                : 'rgba(255,71,87,0.1)',
                              color: comment.isHidden ? '#2ed573' : '#ff4757',
                              border: `1px solid ${comment.isHidden ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.3)'}`,
                              borderRadius: '10px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '0.8'}
                            onMouseOut={(e) => e.target.style.opacity = '1'}
                          >
                            {comment.isHidden ? '👁️ Show' : '🚫 Hide'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar - 1/5 width */}
      <aside className="admin-sidebar">
        <div className="admin-logo">AdminPanel</div>
        <nav className="admin-nav">
          <div 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊 Dashboard</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            <span>👥 Users</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            <span>🛍️ Products</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'order' ? 'active' : ''}`}
            onClick={() => setActiveTab('order')}
          >
            <span>📦 Orders</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'comment' ? 'active' : ''}`}
            onClick={() => { setActiveTab('comment'); setSelectedProductForComments(null); setComments([]); }}
          >
            <span>💬 Comments</span>
          </div>
        </nav>
        <Link to="/" className="admin-home-link">
          <span>🏠 Home</span>
        </Link>
      </aside>

      {/* Main Content - 4/5 width */}
      <main className="admin-content" ref={adminContentRef}>
        <header className="admin-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here is what's happening today.</p>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminPage;
