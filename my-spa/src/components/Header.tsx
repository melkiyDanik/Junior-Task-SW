import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { totalItems, cartItems, totalPrice, updateQuantity, clearCart, updateCartItemAttributes } = useCart();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const location = useLocation();

  // --- НОВАЯ ЛОГИКА ДЛЯ АВТОМАТИЧЕСКОГО ОТКРЫТИЯ КОРЗИНЫ ---
  const prevTotalItems = useRef(totalItems);

  useEffect(() => {
    // Если товаров стало больше, чем было (то есть мы добавили новый), открываем оверлей
    if (totalItems > prevTotalItems.current) {
      setIsOverlayOpen(true);
    }
    // Запоминаем текущее количество для следующей проверки
    prevTotalItems.current = totalItems;
  }, [totalItems]);
  // --------------------------------------------------------

  const categories = ['all', 'clothes', 'tech'];

  useEffect(() => {
    document.body.style.overflow = isOverlayOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOverlayOpen]);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    clearCart();
    setIsOverlayOpen(false);
    alert('Order placed successfully!');
  };

  return (
    <header className="header" style={{ height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 100px', position: 'relative', backgroundColor: '#fff', zIndex: 1000 }}>
      <nav style={{ display: 'flex', gap: '30px', height: '100%', alignItems: 'center' }}>
        {categories.map((cat) => {
          const isActive = location.pathname === `/${cat}` || (cat === 'all' && (location.pathname === '/' || location.pathname === '/all'));
          
          return (
            <Link 
              key={cat}
              to={`/${cat}`} 
              style={{ 
                color: isActive ? '#5ECE7B' : '#1D1F22', 
                borderBottom: isActive ? '2px solid #5ECE7B' : 'none', 
                paddingBottom: '28px', 
                marginTop: '28px',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                textTransform: 'uppercase'
              }}
              data-testid={isActive ? 'active-category-link' : 'category-link'}
            >
              {cat}
            </Link>
          );
        })}
      </nav>

      <Link to="/" style={{ display: 'flex' }}>
        <img src="/src/assets/logo.png" alt="logo" style={{ width: '60px' }}/>
      </Link>

      <div className="actions" style={{ position: 'relative' }}>
        <div 
          onClick={() => setIsOverlayOpen(!isOverlayOpen)} 
          style={{ cursor: 'pointer', position: 'relative' }}
          data-testid="cart-btn"
        >
          <img src="/src/assets/cart-icon-14.png" alt="cart" style={{ width: '26px' }} />
          {totalItems > 0 && (
            <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'black', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
              {totalItems}
            </span>
          )}
        </div>

        {isOverlayOpen && (
          <>
            <div onClick={() => setIsOverlayOpen(false)} style={{ position: 'fixed', top: '80px', left: 0, width: '100%', height: '100%', background: 'rgba(57, 55, 72, 0.22)', zIndex: 998 }} />
            <div data-testid="cart-overlay" style={{ position: 'absolute', top: '50px', right: '-20px', width: '325px', background: 'white', padding: '16px', zIndex: 999, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 20px' }}>
                <span style={{ fontWeight: 700 }}>My Bag</span>, {totalItems} items
              </h4>
              
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {cartItems.map((item) => (
                  <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0 }}>{item.brand}</p>
                      <p style={{ margin: '0 0 10px' }}>{item.name}</p>
                      <p style={{ fontWeight: 500 }}>{item.currency_symbol}{item.price.toFixed(2)}</p>
                      
                      {item.attributes?.map((attr: any) => {
                        const testName = attr.name.toLowerCase().trim().replace(/\s+/g, '-');
                        
                        return (
                          <div key={attr.id} data-testid={`cart-item-attribute-${testName}`} style={{ marginBottom: '10px' }}>
                            <p style={{ fontSize: '12px', margin: '0 0 4px', fontWeight: 700 }}>{attr.name}:</p>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {attr.items.map((opt: any) => {
                                const isColor = attr.type === 'swatch';
                                const isSelected = item.selectedAttributes[attr.id] === opt.id;
                                
                                const itemTestVal = isColor ? opt.value : opt.displayValue;
                                const itemTestValSafe = itemTestVal.trim().replace(/\s+/g, '-');

                                return (
                                  <div
                                    key={opt.id}
                                    data-testid={`cart-item-attribute-${testName}-${itemTestValSafe}`}
                                    onClick={() => updateCartItemAttributes(item.cartId, attr.id, opt.id)}
                                    style={{
                                      width: isColor ? '20px' : 'auto', 
                                      height: '20px', 
                                      minWidth: '24px',
                                      border: isSelected ? '1px solid #5ECE7B' : '1px solid #1D1F22',
                                      backgroundColor: isColor ? opt.value : (isSelected ? '#1D1F22' : 'white'),
                                      color: isSelected && !isColor ? 'white' : 'black',
                                      fontSize: '8px', 
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {!isColor && opt.displayValue}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0 10px' }}>
                      <button data-testid='cart-item-amount-increase' onClick={() => updateQuantity(item.cartId, 1)} style={{ cursor: 'pointer' }}>+</button>
                      <span data-testid='cart-item-amount' style={{ textAlign: 'center' }}>{item.quantity}</span>
                      <button data-testid='cart-item-amount-decrease' onClick={() => updateQuantity(item.cartId, -1)} style={{ cursor: 'pointer' }}>-</button>
                    </div>
                    <img src={item.image} alt={item.name} style={{ width: '100px', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 700 }}>
                <span>Total</span>
                <span data-testid="cart-total-price">{cartItems[0]?.currency_symbol}{totalPrice.toFixed(2)}</span>
              </div>
              <button data-testid="place-order-btn" onClick={handlePlaceOrder} style={{ width: '100%', background: '#5ECE7B', color: 'white', border: 'none', padding: '16px', marginTop: '20px', cursor: 'pointer' }}>PLACE ORDER</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;