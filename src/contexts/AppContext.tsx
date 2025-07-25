
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Product, CartItem, Sale, AppState } from "@/types";
import { toast } from "sonner";
import { generateId, updateProductStock, hasEnoughStock } from "@/utils/helpers";

// تعريف حالة التطبيق الابتدائية
const initialState: AppState = {
  products: [],
  cart: [],
  sales: [],
};

// تعريف أنواع الإجراءات
type AppAction =
  | { type: "INIT_DATA"; payload: Partial<AppState> }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity: number } }
  | { type: "UPDATE_CART_ITEM"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "ADD_SALE"; payload: Sale }
  | { type: "UPDATE_SALE"; payload: Sale };

// مختزل سياق التطبيق
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "INIT_DATA":
      return { ...state, ...action.payload };
      
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      };
      
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
      
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
      };
      
    case "ADD_TO_CART": {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(
        (item) => item.product.id === product.id
      );
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { product, quantity }],
        };
      }
    }
    
    case "UPDATE_CART_ITEM":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
      
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.payload),
      };
      
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };
      
    case "ADD_SALE": {
      // تحديث المخزون عند إتمام البيع
      const updatedProducts = state.products.map((product) => {
        const saleItem = action.payload.items.find(
          (item) => item.product.id === product.id
        );
        
        if (saleItem) {
          return updateProductStock(product, saleItem.quantity);
        }
        
        return product;
      });
      
      return {
        ...state,
        sales: [action.payload, ...state.sales],
        products: updatedProducts,
        cart: [],
      };
    }
    
    case "UPDATE_SALE": {
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? action.payload : sale
        ),
      };
    }
    
    default:
      return state;
  }
};

// إنشاء السياق
interface AppContextType {
  state: AppState;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addSale: (saleData: Omit<Sale, "id" | "createdAt">) => void;
  updateSale: (sale: Sale) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// مزود السياق
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // تحميل البيانات من التخزين المحلي عند بدء التطبيق
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProducts = localStorage.getItem("products");
        const savedSales = localStorage.getItem("sales");
        
        const data: Partial<AppState> = {};
        
        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          // تحويل التواريخ النصية إلى كائنات Date
          data.products = parsedProducts.map((product: any) => ({
            ...product,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
          }));
        }
        
        if (savedSales) {
          const parsedSales = JSON.parse(savedSales);
          // تحويل التواريخ النصية إلى كائنات Date
          data.sales = parsedSales.map((sale: any) => ({
            ...sale,
            createdAt: new Date(sale.createdAt),
            items: sale.items.map((item: any) => ({
              ...item,
              product: {
                ...item.product,
                createdAt: new Date(item.product.createdAt),
                updatedAt: new Date(item.product.updatedAt),
              },
            })),
          }));
        }
        
        if (Object.keys(data).length > 0) {
          dispatch({ type: "INIT_DATA", payload: data });
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        toast.error("حدث خطأ أثناء تحميل البيانات");
      }
    };
    
    loadData();
  }, []);
  
  // حفظ البيانات في التخزين المحلي عند تغيير الحالة
  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem("products", JSON.stringify(state.products));
        localStorage.setItem("sales", JSON.stringify(state.sales));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
        toast.error("حدث خطأ أثناء حفظ البيانات");
      }
    };
    
    if (state.products.length > 0 || state.sales.length > 0) {
      saveData();
    }
  }, [state.products, state.sales]);
  
  // إضافة منتج جديد
  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    dispatch({ type: "ADD_PRODUCT", payload: newProduct });
    toast.success("تمت إضافة المنتج بنجاح");
  };
  
  // تحديث منتج موجود
  const updateProduct = (product: Product) => {
    const updatedProduct = {
      ...product,
      updatedAt: new Date(),
    };
    
    dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });
    toast.success("تم تحديث المنتج بنجاح");
  };
  
  // حذف منتج
  const deleteProduct = (productId: string) => {
    dispatch({ type: "DELETE_PRODUCT", payload: productId });
    toast.success("تم حذف المنتج بنجاح");
  };
  
  // إضافة منتج إلى السلة
  const addToCart = (product: Product, quantity: number) => {
    if (!hasEnoughStock(product, quantity)) {
      toast.error("الكمية المطلوبة غير متوفرة في المخزون");
      return;
    }
    
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity },
    });
    
    toast.success("تمت إضافة المنتج إلى السلة");
  };
  
  // تحديث عنصر في السلة
  const updateCartItem = (productId: string, quantity: number) => {
    const product = state.products.find((p) => p.id === productId);
    
    if (!product) {
      toast.error("المنتج غير موجود");
      return;
    }
    
    if (!hasEnoughStock(product, quantity)) {
      toast.error("الكمية المطلوبة غير متوفرة في المخزون");
      return;
    }
    
    dispatch({
      type: "UPDATE_CART_ITEM",
      payload: { productId, quantity },
    });
  };
  
  // إزالة منتج من السلة
  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    toast.success("تمت إزالة المنتج من السلة");
  };
  
  // تفريغ السلة
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };
  
  // إضافة عملية بيع جديدة
  const addSale = (saleData: Omit<Sale, "id" | "createdAt">) => {
    // التحقق من توفر المخزون للبيع
    for (const item of saleData.items) {
      const product = state.products.find((p) => p.id === item.product.id);
      
      if (!product) {
        toast.error(`المنتج "${item.product.name}" غير موجود`);
        return;
      }
      
      if (!hasEnoughStock(product, item.quantity)) {
        toast.error(
          `الكمية المطلوبة من "${item.product.name}" غير متوفرة في المخزون`
        );
        return;
      }
    }
    
    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    dispatch({ type: "ADD_SALE", payload: newSale });
    toast.success("تم تسجيل عملية البيع بنجاح");
  };
  
  // تحديث عملية بيع
  const updateSale = (sale: Sale) => {
    dispatch({ type: "UPDATE_SALE", payload: sale });
    toast.success("تم تحديث عملية البيع بنجاح");
  };
  
  return (
    <AppContext.Provider
      value={{
        state,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        addSale,
        updateSale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// هوك مخصص لاستخدام سياق التطبيق
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  
  return context;
};
