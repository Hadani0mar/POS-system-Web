
import React, { useState } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CartItemCard from "@/components/CartItemCard";
import CheckoutForm from "@/components/CheckoutForm";
import DebtorManager from "@/components/DebtorManager";
import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, calculateCartTotal, generateReceipt, hasReachedDebtLimit } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, defaultSettings } from "@/types/settings";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Search, ShoppingCart, ReceiptText, Users } from "lucide-react";
import { toast } from "sonner";
import { Sale } from "@/types";

const POS = () => {
  const { 
    state, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    addSale, 
    updateSale 
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debtorManagerOpen, setDebtorManagerOpen] = useState(false);
  const [debtLimitAlert, setDebtLimitAlert] = useState<{ open: boolean, debtorName: string, limit: number }>({
    open: false,
    debtorName: "",
    limit: 0
  });
  
  // Get settings from localStorage
  const savedSettings = localStorage.getItem("settings");
  const settings: Settings = savedSettings 
    ? JSON.parse(savedSettings)
    : defaultSettings;
  
  // Filter products by search and category
  const filteredProducts = state.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If a category is selected, filter products by it
    if (selectedCategory) {
      return matchesSearch && product.category === selectedCategory;
    }
    
    return matchesSearch;
  });
  
  // Calculate cart total
  const cartTotal = calculateCartTotal(state.cart);
  const itemCount = state.cart.reduce((count, item) => count + item.quantity, 0);
  
  // Add product to cart with default quantity 1
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };
  
  // Handle checkout and create receipt
  const handleCheckout = (saleData: any) => {
    // Handle debt limit check
    if (saleData.isDebt && saleData.debtorName) {
      const authorizedDebtor = settings.authorizedDebtors.find(
        d => d.name === saleData.debtorName
      );
      
      if (authorizedDebtor?.limit) {
        const currentDebt = state.sales
          .filter(s => s.isDebt && !s.isFrozen && s.debtorName === saleData.debtorName)
          .reduce((total, sale) => total + sale.finalTotal, 0);
        
        const newTotalDebt = currentDebt + saleData.finalTotal;
        
        if (newTotalDebt > authorizedDebtor.limit) {
          setDebtLimitAlert({
            open: true,
            debtorName: saleData.debtorName,
            limit: authorizedDebtor.limit
          });
          return;
        }
      }
    }
    
    // Add sale to database
    addSale(saleData);
    
    // Generate and print receipt
    generateReceipt(
      { ...saleData, id: "temp", createdAt: new Date() },
      settings.businessName,
      settings.receiptFooter
    );
    
    // Close checkout form
    setCheckoutOpen(false);
  };
  
  // Handle debt payment
  const handlePayDebt = (saleId: string, paymentMethod: "cash" | "card") => {
    const sale = state.sales.find(s => s.id === saleId);
    
    if (sale) {
      const updatedSale: Sale = {
        ...sale,
        isDebt: false,
        paymentMethod: paymentMethod
      };
      
      updateSale(updatedSale);
      
      // Generate receipt for payment
      generateReceipt(
        updatedSale,
        settings.businessName,
        settings.receiptFooter
      );
    }
  };
  
  // Handle freeze debt
  const handleFreezeDebt = (saleId: string, isFrozen: boolean) => {
    const sale = state.sales.find(s => s.id === saleId);
    
    if (sale) {
      const updatedSale: Sale = {
        ...sale,
        isFrozen: isFrozen
      };
      
      updateSale(updatedSale);
    }
  };
  
  // Override debt limit and proceed with checkout
  const handleOverrideDebtLimit = (saleData: any) => {
    addSale(saleData);
    
    generateReceipt(
      { ...saleData, id: "temp", createdAt: new Date() },
      settings.businessName,
      settings.receiptFooter
    );
    
    setDebtLimitAlert({ open: false, debtorName: "", limit: 0 });
    setCheckoutOpen(false);
    
    toast.warning("تم تجاوز حد الدين المسموح به للعميل");
  };
  
  return (
    <Layout>
      <div className="layout-container">
        {/* Products section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            {/* Categories filter */}
            <ScrollArea className="whitespace-nowrap pb-2">
              <div className="flex gap-2 rt">
                <Badge 
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  الكل
                </Badge>
                {/* Make sure categories array exists and has entries */}
                {settings.categories && settings.categories.length > 0 ? (
                  settings.categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category.name)}
                      style={category.color ? { backgroundColor: selectedCategory === category.name ? category.color : 'transparent', borderColor: category.color, color: selectedCategory === category.name ? 'white' : category.color } : {}}
                    >
                      {category.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="cursor-pointer">
                    أخرى
                  </Badge>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="p-4">
              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات متطابقة مع البحث</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Cart section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center dark:text-white">
              <ShoppingCart className="ml-2" />
              سلة المشتريات
              {itemCount > 0 && (
                <span className="mr-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </h2>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDebtorManagerOpen(true)}
            >
              <Users className="ml-2 h-4 w-4" />
              إدارة الديون
            </Button>
          </div>
          
          {state.cart.length > 0 ? (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {state.cart.map((item) => (
                    <CartItemCard
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateCartItem}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold dark:text-white">المجموع:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 dark:text-white dark:hover:bg-gray-700"
                    onClick={() => clearCart()}
                  >
                    تفريغ
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    <ReceiptText className="ml-2 w-4 h-4" />
                    الدفع
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">السلة فارغة</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Checkout form */}
      <CheckoutForm
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={state.cart}
        onCheckout={handleCheckout}
      />
      
      {/* Debt manager dialog */}
      <DebtorManager
        open={debtorManagerOpen}
        onClose={() => setDebtorManagerOpen(false)}
        sales={state.sales}
        onPayDebt={handlePayDebt}
        onFreezeDebt={handleFreezeDebt}
      />
      
      {/* Debt limit alert dialog */}
      <AlertDialog open={debtLimitAlert.open} onOpenChange={(open) => !open && setDebtLimitAlert({ open: false, debtorName: "", limit: 0 })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تحذير تجاوز حد الدين</AlertDialogTitle>
            <AlertDialogDescription>
              العميل {debtLimitAlert.debtorName} سيتجاوز الحد المسموح به للدين ({formatCurrency(debtLimitAlert.limit)}).
              هل ترغب في المتابعة على الرغم من ذلك؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                // Get the checkout data from the form and proceed
                const checkoutData = document.getElementById('checkout-form') as HTMLFormElement;
                if (checkoutData) {
                  const formData = new FormData(checkoutData);
                  const saleData = Object.fromEntries(formData);
                  handleOverrideDebtLimit(saleData);
                }
              }}
            >
              متابعة على الرغم من تجاوز الحد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default POS;
