import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch, apiUrl } from '../utils/api';

const API = apiUrl('/api');
const COMMENT_LIMIT = 5;

// Helper function to format currency to VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StarIcon = ({ filled, half, size = 18, onClick, hoverable }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#ffa502' : half ? 'url(#halfGrad)' : 'none'}
    stroke="#ffa502"
    strokeWidth="2"
    strokeLinejoin="round"
    style={{ cursor: hoverable ? 'pointer' : 'default', transition: 'transform 0.15s' }}
    onClick={onClick}
    onMouseOver={e => hoverable && (e.currentTarget.style.transform = 'scale(1.2)')}
    onMouseOut={e => hoverable && (e.currentTarget.style.transform = 'scale(1)')}
  >
    <defs>
      <linearGradient id="halfGrad">
        <stop offset="50%" stopColor="#ffa502" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const RatingStars = ({ value, showNumber }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffa502', fontWeight: 600, fontSize: showNumber ? '1.2rem' : '1rem' }}>
      <span>{!value || value === 0 ? 'no rate' : `${value}⭐`}</span>
    </div>
  );
};

/* ── Styles object ─────────────────────────────── */
const s = {
  page: {
    padding: '2rem 4rem',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    animation: 'fadeIn 0.4s ease-out forwards',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#8b8b99',
    fontSize: '0.95rem',
    marginBottom: '2rem',
    transition: 'color 0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '3rem',
  },
  imgBox: {
    aspectRatio: '1',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '0.35rem 0.85rem',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 600,
    background: `${color}18`,
    color,
    border: `1px solid ${color}40`,
  }),
  section: {
    marginTop: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #aa3bff, #6b8cff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  commentCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '1.25rem 1.5rem',
    marginBottom: '1rem',
    transition: 'border-color 0.3s',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #aa3bff, #6b8cff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#fff',
    flexShrink: 0,
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    padding: '1rem 1.2rem',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  loadMoreBtn: {
    display: 'block',
    margin: '1.5rem auto 0',
    padding: '0.7rem 2rem',
    borderRadius: 10,
    background: 'rgba(170,59,255,0.12)',
    color: '#aa3bff',
    border: '1px solid rgba(170,59,255,0.25)',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  submitBtn: {
    padding: '0.8rem 2rem',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #aa3bff, #6b8cff)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};

/* ── Component ─────────────────────────────────── */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeImg, setActiveImg] = useState(0);   // index ảnh đang hiển thị lớn

  // comment form
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  /* ── fetch product + initial comments ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign_in');
      return;
    }
    fetchData(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async (offset = 0, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `${API}/product/${id}?commentOffset=${offset}&commentLimit=${COMMENT_LIMIT}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await res.json();

      if (data.product) setProduct(data.product);
      if (reset) {
        setComments(data.comment || []);
      } else {
        setComments(prev => [...prev, ...(data.comment || [])]);
      }
      setPagination(data.commentPagination || null);
    } catch {
      console.error('Failed to load product');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* ── load more comments ── */
  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      fetchData(pagination.nextOffset, false);
    }
  };

  /* ── handle file selection ── */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      return alert('Maximum 5 images allowed');
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ── submit comment ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('content', content);
      formData.append('rating', rating);
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`${API}/product/${id}/comment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.comment) {
        setComments(prev => [data.comment, ...prev]);
        setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : prev);
        setContent('');
        setRating(0);
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        alert(data.message || data.error || 'Failed to post comment');
      }
    } catch {
      alert('Cannot connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── helpers ── */
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  // Chuẩn hóa images thành mảng (tương thích cả string cũ lẫn array mới)
  const images = product
    ? (Array.isArray(product.image)
        ? product.image.filter(Boolean)
        : product.image ? [product.image] : [])
    : [];

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg(i => (i + 1) % images.length);

  /* ── render ── */
  if (loading) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid rgba(170,59,255,0.2)',
            borderTopColor: '#aa3bff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#8b8b99' }}>Loading product...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ ...s.page, textAlign: 'center', paddingTop: '6rem' }}>
        <h2 style={{ color: '#ff4757' }}>Product not found</h2>
        <Link to="/" style={{ color: '#aa3bff', marginTop: '1rem', display: 'inline-block' }}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ── Product Info ── */}
      <div style={s.grid}>
        {/* Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main image + arrows */}
          <div style={{ ...s.imgBox, position: 'relative' }}>
            {images.length > 0 ? (
              <img
                key={activeImg}
                src={images[activeImg]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, animation: 'fadeIn 0.25s ease-out' }}
              />
            ) : (
              <span style={{ fontSize: '6rem' }}>🛍️</span>
            )}

            {/* Prev arrow */}
            {images.length > 1 && (
              <button onClick={prevImg} style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)', transition: 'background 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(170,59,255,0.7)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              >&#8249;</button>
            )}

            {/* Next arrow */}
            {images.length > 1 && (
              <button onClick={nextImg} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)', transition: 'background 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(170,59,255,0.7)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              >&#8250;</button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {images.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
                    cursor: 'pointer', flexShrink: 0,
                    border: i === activeImg
                      ? '2px solid #aa3bff'
                      : '2px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.2s, transform 0.2s',
                    transform: i === activeImg ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseOver={e => { if (i !== activeImg) e.currentTarget.style.borderColor = 'rgba(170,59,255,0.5)'; }}
                  onMouseOut={e => { if (i !== activeImg) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <img src={url} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', fontWeight: 700 }}>
            {product.name}
          </h1>
          <div style={{ marginBottom: '1.2rem' }}>
            <RatingStars value={product.rate || 0} size={20} showNumber />
          </div>
          <p style={{ color: '#8b8b99', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            {product.describe || 'No description available.'}
          </p>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#aa3bff', marginBottom: '1.5rem' }}>
            {formatVND(product.cost)}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {product.stock > 0 ? (
              <span style={s.badge('#2ed573')}>✓ In Stock: {product.stock}</span>
            ) : (
              <span style={s.badge('#ff4757')}>✗ Out of Stock</span>
            )}
            <span style={s.badge('#6b8cff')}>🔥 {product.purchased || 0} sold</span>

          </div>

          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              apiFetch(`${API}/cart`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productID: product._id }),
              }).then(data => {
                if (data?.products) alert('Added to cart!');
                else alert(data?.message || 'Failed');
              });
            }}
            disabled={product.stock <= 0}
            style={{
              ...s.submitBtn,
              width: 'fit-content',
              opacity: product.stock <= 0 ? 0.4 : 1,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={e => product.stock > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1rem 0' }} />

      {/* ── Write a Review ── */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Write a Review</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '1.5rem 2rem',
          }}
        >
          {/* Star picker */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b8b99', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>
              Your Rating
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  filled={i <= (hoverRating || rating)}
                  size={28}
                  hoverable
                  onClick={() => setRating(i)}
                  onMouseOver={() => setHoverRating(i)}
                  onMouseOut={() => setHoverRating(0)}
                />
              ))}
              {rating > 0 && (
                <span style={{ color: '#ffa502', marginLeft: 8, fontWeight: 600, alignSelf: 'center' }}>
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Text */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: '#8b8b99', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>
              Your Comment
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts about this product..."
              style={s.textarea}
              onFocus={e => {
                e.target.style.borderColor = '#aa3bff';
                e.target.style.boxShadow = '0 0 0 2px rgba(170,59,255,0.2)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#8b8b99', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>
              Add Images (Max 5)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => removeFile(i)}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,71,87,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <label style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#aa3bff'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <span style={{ fontSize: '1.5rem', color: '#8b8b99' }}>+</span>
                  <span style={{ fontSize: '0.7rem', color: '#8b8b99' }}>Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ ...s.submitBtn, opacity: submitting ? 0.6 : 1 }}
            onMouseOver={e => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {submitting ? 'Posting...' : '✍️ Post Review'}
          </button>
        </form>
      </div>

      {/* ── Comments List ── */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>
          Customer Reviews {pagination && `(${pagination.total})`}
        </h2>

        {comments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#8b8b99',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</p>
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {comments.map((c, idx) => (
              <div
                key={c._id || idx}
                style={s.commentCard}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(170,59,255,0.2)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                  <div style={s.avatar}>
                    {getInitial(c.user?.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {c.user?.name || 'Anonymous'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <RatingStars value={c.rating} size={14} />
                      <span style={{ color: '#8b8b99', fontSize: '0.8rem' }}>
                        {timeAgo(c.createAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Body */}
                {c.content && (
                  <p style={{ color: '#ccc', lineHeight: 1.6, margin: '0 0 1rem 50px' }}>
                    {c.content}
                  </p>
                )}
                {/* Comment Images */}
                {c.images && c.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingLeft: 50 }}>
                    {c.images.map((img, i) => (
                      <div 
                        key={i} 
                        style={{ width: 100, height: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'zoom-in' }}
                        onClick={() => window.open(img, '_blank')}
                      >
                        <img src={img} alt="review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            {pagination?.hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ ...s.loadMoreBtn, opacity: loadingMore ? 0.5 : 1 }}
                onMouseOver={e => {
                  if (!loadingMore) {
                    e.currentTarget.style.background = '#aa3bff';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(170,59,255,0.12)';
                  e.currentTarget.style.color = '#aa3bff';
                }}
              >
                {loadingMore ? 'Loading...' : `Load More Reviews (${pagination.total - comments.length} remaining)`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;
