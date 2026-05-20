import { formatVND, getPrimaryImage } from '../adminUtils';

function ProductsPanel({
  products,
  productSearchTerm,
  setProductSearchTerm,
  fetchProducts,
  productPagination,
  loadingMoreProducts,
  handleLoadMoreProducts,
  newProduct,
  setNewProduct,
  editingProductId,
  handleSaveProduct,
  handleCancelEdit,
  handleEditProduct,
  handleDeleteProduct,
}) {
  return (
          <div className="admin-panel" key="product">
            <h2>Product Catalog</h2>
            <p style={{ color: '#8b8b99', marginTop: '1rem', marginBottom: '1rem' }}>
              Manage your store products, inventory, pricing, and categories.
            </p>

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
                    {getPrimaryImage(product.image) ? (
                      <>
                        <img
                          src={getPrimaryImage(product.image)}
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
                      'No image'
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
}

export default ProductsPanel;
