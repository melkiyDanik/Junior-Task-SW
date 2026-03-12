import { gql } from '@apollo/client/index.js';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      inStock
      gallery
      brand
      category  # <--- ТЕПЕРЬ КАТЕГОРИЯ ПРИХОДИТ ИЗ БАЗЫ
      attributes {
        id
        name
        type
        items {
          displayValue
          value
          id
        }
      }
      prices {
        amount
        currency_symbol
        currency_label
      }
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($id: String!) {
    product(id: $id) {
      id
      name
      brand
      inStock
      gallery
      description
      category
      attributes {
        id
        name
        type
        items {
          displayValue
          value
          id
        }
      }
      prices {
        amount
        currency_symbol
        currency_label
      }
    }
  }
`;