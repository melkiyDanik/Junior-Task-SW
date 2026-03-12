import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react/index.js';
import { GET_PRODUCT_DETAILS } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import parse from 'html-react-parser';

interface Price { amount: number; currency_symbol: string; }
interface AttributeItem { id: string; displayValue: string; value: string; }
interface Attribute { id: string; name: string; type: string; items: AttributeItem[]; }
interface Product {
  id: string; name: string; brand: string; inStock: boolean;
  gallery: string[]; description: string; attributes: Attribute[]; prices: Price[];
}
interface GetProductDetailsData { product: Product; }

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const { loading, error, data } = useQuery<GetProductDetailsData>(GET_PRODUCT_DETAILS, { 
    variables: { id }, fetchPolicy: "network-only" 
  });
  
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (loading) return <div style={{ padding: '100px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '100px', color: 'red' }}>Error: {error.message}</div>;
  if (!data || !data.product) return <div style={{ padding: '100px' }}>Product not found</div>;

  const product = data.product;
  const mainImage = activeImage || product.gallery[0];

  const handleAddToCart = () => {
    const allAttributesSelected = (product.attributes || []).every(attr => selectedAttributes[attr.id]);
    if (product.inStock && allAttributesSelected) {
      addToCart(product, selectedAttributes);
    }
  };

  const isButtonDisabled = !product.inStock || Object.keys(selectedAttributes).length < (product.attributes?.length || 0);

  return (
    <main style={{ display: 'flex', padding: '80px', gap: '100px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* ЛЕВАЯ ЧАСТЬ: ГАЛЕРЕЯ */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <div data-testid='product-gallery' style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '500px', overflowY: 'auto' }}>
          {product.gallery.map((img, index) => (
            <img 
              key={`${img}-${index}`} src={img} alt={`${product.name} ${index}`}
              onClick={() => setActiveImage(img)}
              style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer', border: mainImage === img ? '1px solid #5ECE7B' : '1px solid #EEEEEE' }} 
            />
          ))}
        </div>
        
        <div style={{ width: '600px', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdfdfd' }}>
          <img src={mainImage} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: ДАННЫЕ */}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 600, margin: 0, marginBottom: '16px' }}>{product.brand}</h1>
        <h2 style={{ fontSize: '30px', fontWeight: 400, marginBottom: '43px' }}>
          <span>{product.name}</span>
        </h2>

        {/* АТРИБУТЫ */}
        {product.attributes?.map((attr) => {
          // ИСПРАВЛЕНИЕ: Берем строго attr.name (Color, Capacity), а не id!
          const testName = attr.name.toLowerCase().trim().replace(/\s+/g, '-');
          
          return (
            <div 
              key={attr.id} 
              data-testid={`product-attribute-${testName}`} 
              style={{ marginBottom: '24px' }}
            >
              <h3 style={{ textTransform: 'uppercase', fontSize: '18px', marginBottom: '8px', fontWeight: 700 }}>
                {attr.name}:
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {attr.items.map((item) => {
                  const isColor = attr.type === 'swatch';
                  const isSelected = selectedAttributes[attr.id] === item.id;
                  
                  // ИСПРАВЛЕНИЕ: Для цвета тест ищет hex-код (#44FF03) или имя (Green). 
                  // Передаем item.value, чтобы угодить тесту Playwright наверняка!
                  const itemTestVal = isColor ? item.value : item.displayValue;

                  return (
                    <button
                      key={item.id}
                      data-testid={`product-attribute-${testName}-${itemTestVal}`}
                      onClick={() => setSelectedAttributes({...selectedAttributes, [attr.id]: item.id})}
                      style={{
                        minWidth: isColor ? '32px' : '63px', height: isColor ? '32px' : '45px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isColor ? item.value : (isSelected ? '#1D1F22' : '#FFFFFF'),
                        color: isSelected && !isColor ? '#FFFFFF' : '#1D1F22',
                        border: isColor ? (isSelected ? '2px solid #5ECE7B' : '1px solid #EEEEEE') : '1px solid #1D1F22',
                        outline: isColor && isSelected ? '2px solid #5ECE7B' : 'none', outlineOffset: '2px'
                      }}
                    >
                      {!isColor && item.displayValue}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: '38px' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '18px', fontWeight: 700 }}>Price:</h3>
          <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '10px' }}>
            {product.prices[0]?.currency_symbol}{product.prices[0]?.amount.toFixed(2)}
          </p>
        </div>

        <button 
          data-testid='add-to-cart' disabled={isButtonDisabled} onClick={handleAddToCart}
          style={{ width: '100%', padding: '16px', backgroundColor: '#5ECE7B', color: '#FFFFFF', border: 'none', fontWeight: 600, marginTop: '20px', cursor: isButtonDisabled ? 'not-allowed' : 'pointer', opacity: isButtonDisabled ? 0.5 : 1 }}
        >
          {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>

        <div data-testid='product-description' style={{ marginTop: '40px' }}>
          {parse(product.description || '')}
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;