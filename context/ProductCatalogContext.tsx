import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { notifyProductLimitReached } from '@/lib/notifications';
import { MAX_PRODUCTS, Product } from '@/types/product';

type ProductInput = {
  name: string;
  price: number;
  imageUri: string;
};

type ProductCatalogState = {
  products: Product[];
};

type ProductCatalogAction =
  | {
      type: 'ADD_PRODUCT';
      payload: Product;
    }
  | {
      type: 'REMOVE_PRODUCT';
      payload: { id: string };
    }
  | {
      type: 'CLEAR_PRODUCTS';
    }
  | {
      type: 'RESET_LIMIT_FLAG';
    };

type ProductCatalogContextValue = {
  products: Product[];
  isLimitReached: boolean;
  hasNewlyReachedLimit: boolean;
  addProduct: (input: ProductInput) => Promise<boolean>;
  removeProduct: (id: string) => void;
  clearProducts: () => void;
  resetNewLimitFlag: () => void;
};

const initialState: ProductCatalogState & { hasNewlyReachedLimit: boolean } = {
  products: [],
  hasNewlyReachedLimit: false,
};

function productCatalogReducer(
  state: ProductCatalogState & { hasNewlyReachedLimit: boolean },
  action: ProductCatalogAction,
) {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      if (state.products.length >= MAX_PRODUCTS) {
        return state;
      }

      const nextProducts = [action.payload, ...state.products];
      return {
        ...state,
        products: nextProducts,
        hasNewlyReachedLimit: nextProducts.length === MAX_PRODUCTS,
      };
    }
    case 'RESET_LIMIT_FLAG':
      return {
        ...state,
        hasNewlyReachedLimit: false,
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload.id),
        hasNewlyReachedLimit: false,
      };
    case 'CLEAR_PRODUCTS':
      return {
        ...state,
        products: [],
        hasNewlyReachedLimit: false,
      };
    default:
      return state;
  }
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(
  null,
);

export function ProductCatalogProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(productCatalogReducer, initialState);

  const addProduct = async (input: ProductInput) => {
    if (state.products.length >= MAX_PRODUCTS) {
      await notifyProductLimitReached();
      return false;
    }

    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: input.name.trim(),
        price: input.price,
        imageUri: input.imageUri,
        createdAt: Date.now(),
      },
    });
    return true;
  };

  const value = useMemo<ProductCatalogContextValue>(
    () => ({
      products: state.products,
      isLimitReached: state.products.length >= MAX_PRODUCTS,
      hasNewlyReachedLimit: state.hasNewlyReachedLimit,
      addProduct,
      removeProduct: (id: string) => {
        dispatch({ type: 'REMOVE_PRODUCT', payload: { id } });
      },
      clearProducts: () => {
        dispatch({ type: 'CLEAR_PRODUCTS' });
      },
      resetNewLimitFlag: () => {
        dispatch({ type: 'RESET_LIMIT_FLAG' });
      },
    }),
    [state.hasNewlyReachedLimit, state.products],
  );

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);

  if (!context) {
    throw new Error(
      'useProductCatalog must be used within a ProductCatalogProvider',
    );
  }

  return context;
}
