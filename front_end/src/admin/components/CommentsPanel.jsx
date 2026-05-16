import { formatVND, getPrimaryImage } from '../adminUtils';

function CommentsPanel({
  products,
  selectedProductForComments,
  handleSelectProductForComments,
  handleBackToProductList,
  loadingComments,
  comments,
  handleToggleCommentVisibility,
}) {
  return (
          <div className="admin-panel" key="comment">
            {!selectedProductForComments ? (
              /* ── Product List View ── */
              <>
                <h2>Comment Management</h2>
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
                        {getPrimaryImage(product.image) ? (
                          <img src={getPrimaryImage(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.9rem', color: '#8b8b99' }}>No image</span>
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
                          View Comments
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
                    {getPrimaryImage(selectedProductForComments.image) ? (
                      <img src={getPrimaryImage(selectedProductForComments.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#8b8b99' }}>No image</span>
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
                                  <span style={{ color: '#ffa502', fontWeight: 600 }}>{comment.rating || 0}/5</span>
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
                                Hidden
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
                            {comment.isHidden ? 'Show' : 'Hide'}
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
}

export default CommentsPanel;
