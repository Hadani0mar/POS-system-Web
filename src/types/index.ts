
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  barcode?: string;
  category: string;
  image?: string;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  tax: number;
  discount: number;
  finalTotal: number;
  paymentMethod: "cash" | "card" | "debt" | "other";
  isDebt: boolean;
  isFrozen?: boolean;
  debtorName?: string;
  customerName?: string;
  customerPhone?: string;
  discountReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
}

export interface Settings {
  businessName: string;
  location?: string;
  receiptFooter?: string;
  shouldApplyTax: boolean;
  taxRate: number;
  authorizedDebtors: { name: string; limit: number; id: string }[];
  categories: { name: string; color?: string; id: string }[];
  printDiscountReasons?: boolean;
  printNotes?: boolean;
}

export interface ShiftReport {
  id: string;
  date: Date;
  salesCount: number;
  totalSales: number;
  totalCashSales: number;
  totalCardSales: number;
  totalDebtSales: number;
  cashInDrawer: number;
  cashShortage: number;
  expenses?: number;
  paidDebts?: Sale[];
  notes?: string;
}

export interface Expense {
  id: string;
  amount: number;
  reason: string;
  date: Date;
}
