import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    // Если используешь -t public, попробуй сначала корень
    uri: 'http://localhost:8081/', 
  }),
  cache: new InMemoryCache(),
});

export default client;