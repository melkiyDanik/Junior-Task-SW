import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './components/ProductList'; 
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header /> 
          <main style={{ minHeight: 'calc(100vh - 80px)' }}>
            <Routes>
              {/* Маршрут по умолчанию (категория 'all') */}
              <Route path="/" element={<ProductList />} />
              
              {/* Динамический маршрут для категорий из БД: /clothes, /tech и т.д. */}
              <Route path="/:category" element={<ProductList />} />
              
              {/* Страница товара */}
              <Route path="/product/:id" element={<ProductDetails />} />
              
              {/* Редирект при ошибке в URL */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;