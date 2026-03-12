
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react/index.js';
import client from './apollo-client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Убираем StrictMode для теста
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);