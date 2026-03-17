import { useQuery } from '@apollo/client/react/index.js';
import { Link, useParams } from 'react-router-dom';
import { GET_PRODUCTS } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import '../App.css'; 

// Интерфейсы данных
interface Product {
  id: string;
  name: string;
  inStock: boolean;
  gallery: string[];
  brand: string;
  category: string; 
  attributes: any[];
  prices: { amount: number; currency_symbol: string; }[];
}

const ProductList = () => {
  const { category: urlCategory } = useParams(); 
  const activeCategory = urlCategory || 'all';

  const { loading, error, data } = useQuery<{ products: Product[] }>(GET_PRODUCTS);
  const { addToCart } = useCart();

  if (loading) return <div style={{ padding: '80px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '80px', color: 'red' }}>Error: {error.message}</div>;

  const products = data?.products || [];
  const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); 
    e.stopPropagation();
    const attrs: Record<string, string> = {};
    product.attributes.forEach(a => { if (a.items.length > 0) attrs[a.id] = a.items[0].id; });
    addToCart(product, attrs);
  };

  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '42px', marginBottom: '80px', textTransform: 'capitalize', textAlign: 'left' }}>
        {activeCategory}
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 100px' }}>
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="product-card" 
            style={{ padding: '16px', transition: 'box-shadow 0.3s ease' }}
          > 
            <Link 
              to={`/product/${product.id}`} 
              style={{ textDecoration: 'none', color: 'inherit', opacity: product.inStock ? 1 : 0.5, display: 'block' }}
              data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* --- КОНТЕЙНЕР ДЛЯ КАРТИНКИ --- */}
              <div style={{ position: 'relative', height: '330px', marginBottom: '24px' }}>
                
                {!product.inStock && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', zIndex: 2 }}>
                    <span style={{ fontSize: '24px', color: '#8D8F9A', textTransform: 'uppercase' }}>Out of stock</span>
                  </div>
                )}
                
                <img src={product.gallery[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

                {/* --- КНОПКА КОРЗИНЫ (Снова внутри картинки) --- */}
                {product.inStock && (
                  <div 
                    className="quick-add-btn"
                    data-testid="quick-add-btn"
                    onClick={(e) => handleQuickAdd(e, product)}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '260px', 
                      // Идеальное положение: ровно на границе картинки и отступа
                      bottom: '10px', 
                      zIndex: 10,
                      backgroundColor: '#5ECE7B',
                      borderRadius: '50%',
                      width: '52px',
                      height: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 11px rgba(29, 31, 34, 0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                     <img 
                       src="/src/assets/cart-icon-14.png" 
                       alt="Add to cart" 
                       style={{ width: '24px', filter: 'brightness(0) invert(1)' }} 
                     />
                  </div>
                )}
              </div>
              {/* ------------------------------------------------------ */}

              {/* --- ТЕКСТОВАЯ ИНФОРМАЦИЯ --- */}
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 300, marginBottom: '8px', display: 'flex', gap: '4px' }}>
                  <span>{product.brand}</span>
                  <span>{product.name}</span>
                </h2>
                <p style={{ fontSize: '18px', fontWeight: 500 }}>
                  <span>{product.prices[0]?.currency_symbol}</span>
                  <span>{product.prices[0]?.amount.toFixed(2)}</span>
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProductList;