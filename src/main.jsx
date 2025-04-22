import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Set up Apollo Client
const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
