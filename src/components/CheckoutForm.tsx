import React, { useState, useEffect } from "react";
import { CartItem, Sale, SaleItem } from "@/types";
import { formatCurrency, calculateCartTotal, calculateFinalTotal } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { defaultSettings } from "@/types/settings";

interface CheckoutFormProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onCheckout: (sale: Omit<Sale, "id" | "createdAt">) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  open,
  onClose,
  cartItems,
  onCheckout,
}) => {
  // Get settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("settings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "cash" as "cash" | "card" | "other",
    discount: 0,
    discountReason: "",
    tax: settings.shouldApplyTax ? 15 : 0,
    notes: "",
    isDebt: false,
    selectedDebtor: ""
  });
  
  const subtotal = calculateCartTotal(cartItems);
  const finalTotal = calculateFinalTotal(subtotal, formData.tax, formData.discount);
  
  useEffect(() => {
    // Update tax setting when settings change
    setFormData(prev => ({
      ...prev,
      tax: settings.shouldApplyTax ? 15 : 0
    }));
  }, [settings.shouldApplyTax]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handlePaymentMethodChange = (value: string) => {
    // If payment method is debt, validate if customer is in authorized debtors
    const isDebt = value === "other";
    
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value as "cash" | "card" | "other",
      isDebt: isDebt
    }));
  };

  const handleDebtorChange = (value: string) => {
    const selectedDebtor = settings.authorizedDebtors.find(d => d.name === value);
    
    setFormData((prev) => ({
      ...prev,
      selectedDebtor: value,
      customerName: selectedDebtor?.name || prev.customerName,
      customerPhone: selectedDebtor?.phone || prev.customerPhone
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If discount is applied but no reason provided, alert the user
    if (formData.discount > 0 && !formData.discountReason) {
      alert("يرجى إدخال سبب الخصم");
      return;
    }
    
    // If it's a debt sale, validate debtor selection
    if (formData.isDebt && !formData.selectedDebtor) {
      alert("يرجى اختيار المدين من القائمة");
      return;
    }
    
    const saleItems: SaleItem[] = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product.price
    }));
    
    const saleData: Omit<Sale, "id" | "createdAt"> = {
      items: saleItems,
      total: subtotal,
      discount: formData.discount,
      tax: formData.tax,
      finalTotal: finalTotal,
      paymentMethod: formData.paymentMethod,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      notes: formData.notes || undefined,
      discountReason: formData.discount > 0 ? formData.discountReason : undefined,
      isDebt: formData.isDebt,
      debtorName: formData.isDebt ? formData.selectedDebtor : undefined
    };
    
    onCheckout(saleData);
  };
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto max-h-screen" side="left">
        <SheetHeader>
          <SheetTitle>إتمام عملية البيع</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">تفاصيل الفاتورة</h3>
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span>المجموع:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>الخصم:</span>
                <div className="w-24">
                  <Input
                    type="number"
                    name="discount"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleChange}
                    className="h-8 text-left"
                  />
                </div>
              </div>
              
              {formData.discount > 0 && (
                <div className="space-y-1">
                  <Label htmlFor="discountReason" className="text-sm">سبب الخصم*</Label>
                  <Input
                    id="discountReason"
                    name="discountReason"
                    value={formData.discountReason}
                    onChange={handleChange}
                    placeholder="سبب منح الخصم"
                    className="h-8"
                    required
                  />
                </div>
              )}
              
              {settings.shouldApplyTax && (
                <div className="flex justify-between items-center">
                  <span>الضريبة (%):</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      name="tax"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax}
                      onChange={handleChange}
                      className="h-8 text-left"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>الإجمالي:</span>
                <span className="text-primary">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">بيانات العميل (اختياري)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="customerName">اسم العميل</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">رقم الهاتف</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="other">دين</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.isDebt && (
              <div className="space-y-2 p-3 border rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                <Label htmlFor="selectedDebtor">اختر المدين</Label>
                {settings.authorizedDebtors.length > 0 ? (
                  <Select
                    value={formData.selectedDebtor}
                    onValueChange={handleDebtorChange}
                  >
                    <SelectTrigger id="selectedDebtor">
                      <SelectValue placeholder="اختر من قائمة المدينين" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.authorizedDebtors.map((debtor, index) => (
                        <SelectItem key={index} value={debtor.name}>
                          {debtor.name} {debtor.limit ? `(الحد: ${debtor.limit} د.ل)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-destructive">
                    لا يوجد مدينين معتمدين. يرجى إضافة مدينين من إعدادات النظام.
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="ملاحظات إضافية حول البيع"
                rows={3}
              />
            </div>
          </div>
          
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" className="w-full">
              إتمام البيع
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CheckoutForm;
