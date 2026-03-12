import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  cartId: string;
  id: string;
  name: string;
  brand: string;
  price: number;
  currency_symbol: string;
  image: string;
  quantity: number;
  selectedAttributes: Record<string, string>;
  attributes: any[];
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: any, selectedAttributes: Record<string, string>) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  updateCartItemAttributes: (cartId: string, attrId: string, valueId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Инициализация стейта данными из LocalStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('scandiweb_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Сохраняем корзину в LocalStorage при каждом её изменении
  useEffect(() => {
    localStorage.setItem('scandiweb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const generateCartId = (id: string, attrs: Record<string, string>) => {
    return `${id}-${JSON.stringify(Object.keys(attrs).sort().reduce((obj, key) => {
      obj[key] = attrs[key];
      return obj;
    }, {} as any))}`;
  };

  const addToCart = (product: any, selectedAttributes: Record<string, string>) => {
    const cartId = generateCartId(product.id, selectedAttributes);
    
    setCartItems(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        cartId,
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.prices[0].amount,
        currency_symbol: product.prices[0].currency_symbol,
        image: product.gallery[0],
        quantity: 1,
        selectedAttributes,
        attributes: product.attributes
      }];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const updateCartItemAttributes = (cartId: string, attrId: string, valueId: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newAttrs = { ...item.selectedAttributes, [attrId]: valueId };
        return { ...item, selectedAttributes: newAttrs, cartId: generateCartId(item.id, newAttrs) };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, totalItems, totalPrice, addToCart, updateQuantity, updateCartItemAttributes, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};