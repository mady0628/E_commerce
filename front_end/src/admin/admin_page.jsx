import { useState, useEffect, useRef } from 'react';
import './admin_page.css';
import AdminContent from './components/AdminContent';
import AdminSidebar from './components/AdminSidebar';
import { apiUrl } from '../utils/api';

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
      const data = await res.json();
      if (res.ok) {
        if (data.message && data.message.toLowerCase().includes('admin')) {
          alert(data.message);
          return;
        }
        fetchUsers();
      } else {
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

  const renderContent = () => (
    <AdminContent
      activeTab={activeTab}
      orders={orders}
      users={users}
      userSearchTerm={userSearchTerm}
      setUserSearchTerm={setUserSearchTerm}
      fetchUsers={fetchUsers}
      handleDeleteUser={handleDeleteUser}
      products={products}
      productSearchTerm={productSearchTerm}
      setProductSearchTerm={setProductSearchTerm}
      fetchProducts={fetchProducts}
      productPagination={productPagination}
      loadingMoreProducts={loadingMoreProducts}
      handleLoadMoreProducts={handleLoadMoreProducts}
      newProduct={newProduct}
      setNewProduct={setNewProduct}
      editingProductId={editingProductId}
      handleSaveProduct={handleSaveProduct}
      handleCancelEdit={handleCancelEdit}
      handleEditProduct={handleEditProduct}
      handleDeleteProduct={handleDeleteProduct}
      orderSearchTerm={orderSearchTerm}
      setOrderSearchTerm={setOrderSearchTerm}
      fetchOrders={fetchOrders}
      handleUpdateOrderStatus={handleUpdateOrderStatus}
      selectedProductForComments={selectedProductForComments}
      handleSelectProductForComments={handleSelectProductForComments}
      handleBackToProductList={handleBackToProductList}
      loadingComments={loadingComments}
      comments={comments}
      handleToggleCommentVisibility={handleToggleCommentVisibility}
    />
  );

  return (
    <div className="admin-container">
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'comment') {
            setSelectedProductForComments(null);
            setComments([]);
          }
        }}
      />

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
