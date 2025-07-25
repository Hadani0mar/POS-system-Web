
import { Product, CartItem, Sale, ShiftReport } from "@/types";

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Format currency for display (Libyan Dinar)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-LY", {
    style: "currency",
    currency: "LYD",
  }).format(amount);
};

// Calculate cart total
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
};

// Calculate final total with tax and discount
export const calculateFinalTotal = (
  total: number,
  tax: number,
  discount: number
): number => {
  const afterDiscount = total - discount;
  const afterTax = tax > 0 ? afterDiscount + (afterDiscount * tax) / 100 : afterDiscount;
  return afterTax;
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Re-export from printingHelpers.ts
export { generateReceipt, generateShiftReport } from './printingHelpers';

// Filter sales by date range
export const filterSalesByDateRange = (
  sales: Sale[],
  startDate: Date,
  endDate: Date
): Sale[] => {
  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= startDate && saleDate <= endDate;
  });
};

// Calculate total sales for a period
export const calculateTotalSales = (sales: Sale[]): number => {
  return sales.reduce((total, sale) => {
    return total + sale.finalTotal;
  }, 0);
};

// Get today's sales
export const getTodaySales = (sales: Sale[]): Sale[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });
};

// Check if product has enough stock
export const hasEnoughStock = (product: Product, quantity: number): boolean => {
  return product.stock >= quantity;
};

// Update product stock
export const updateProductStock = (
  product: Product,
  quantity: number
): Product => {
  return {
    ...product,
    stock: product.stock - quantity,
    updatedAt: new Date(),
  };
};

// Export JSON data 
export const exportDataToJson = (data: any): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `nora_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import JSON data
export const importDataFromJson = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          resolve(data);
        } else {
          reject(new Error('Failed to read file'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Track debts
export const getDebtsForCustomer = (sales: Sale[], customerName: string): number => {
  return sales
    .filter(sale => sale.isDebt && !sale.isFrozen && sale.debtorName === customerName)
    .reduce((total, sale) => total + sale.finalTotal, 0);
};

// Check if customer has reached debt limit
export const hasReachedDebtLimit = (
  sales: Sale[], 
  customerName: string, 
  limit: number
): boolean => {
  const totalDebt = getDebtsForCustomer(sales, customerName);
  return totalDebt >= limit;
};

// Calculate end-of-shift summary
export const calculateShiftSummary = (sales: Sale[]) => {
  const totalCashSales = sales
    .filter(sale => sale.paymentMethod === 'cash')
    .reduce((total, sale) => total + sale.finalTotal, 0);
    
  const totalCardSales = sales
    .filter(sale => sale.paymentMethod === 'card')
    .reduce((total, sale) => total + sale.finalTotal, 0);
    
  const totalDebtSales = sales
    .filter(sale => sale.isDebt || sale.paymentMethod === 'other')
    .reduce((total, sale) => total + sale.finalTotal, 0);
    
  const totalSales = totalCashSales + totalCardSales + totalDebtSales;
  
  return {
    totalSales,
    totalCashSales,
    totalCardSales,
    totalDebtSales,
    salesCount: sales.length
  };
};

// Get all debtors with their total debts
export const getAllDebtors = (sales: Sale[]) => {
  const debtors = new Map();
  
  sales.forEach(sale => {
    if (sale.isDebt && !sale.isFrozen && sale.debtorName) {
      const debtorName = sale.debtorName;
      if (!debtors.has(debtorName)) {
        debtors.set(debtorName, {
          name: debtorName,
          totalDebt: 0,
          sales: []
        });
      }
      
      const debtor = debtors.get(debtorName);
      debtor.totalDebt += sale.finalTotal;
      debtor.sales.push(sale);
    }
  });
  
  return Array.from(debtors.values());
};

// Get shift reports by date range
export const getShiftReportsByDateRange = (
  reports: ShiftReport[],
  startDate: Date,
  endDate: Date
): ShiftReport[] => {
  return reports.filter((report) => {
    const reportDate = new Date(report.date);
    return reportDate >= startDate && reportDate <= endDate;
  });
};
