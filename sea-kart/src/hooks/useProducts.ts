import { useQuery } from '@tanstack/react-query';
import { Product, products as staticProducts } from '../data/products';

import { getApiBase } from '../config/api';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${getApiBase()}/api/products`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data && data.length > 0 ? data : staticProducts;
  } catch (error) {
    console.warn("Failed to fetch products from backend, falling back to static data", error);
    return staticProducts;
  }
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    refetchInterval: 3000,
    staleTime: 0,
  });
};

