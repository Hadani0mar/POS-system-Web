
import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { Settings, defaultSettings } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  // الحصول على الفئات من الإعدادات
  const savedSettings = localStorage.getItem("settings");
  const settings: Settings = savedSettings 
    ? JSON.parse(savedSettings)
    : defaultSettings;
  
  // Make sure categories is never undefined by using empty array as fallback
  const categories = settings.categories?.map(cat => cat.name) || [];
  
  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || (categories.length > 0 ? categories[0] : "أخرى"),
    barcode: initialData?.barcode || "",
    cost: initialData?.cost || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // تحديث الفئات عند تغيير الإعدادات
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    
    // مسح أي خطأ عند تحديث الحقل
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "يجب أن يكون السعر أكبر من صفر";
    }
    
    if (formData.stock < 0) {
      newErrors.stock = "يجب أن تكون الكمية صفر أو أكثر";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "تعديل منتج" : "إضافة منتج جديد"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المنتج</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">التكلفة</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">الكمية</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={errors.stock ? "border-destructive" : ""}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">الباركود (اختياري)</Label>
            <Input
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              {initialData ? "حفظ التغييرات" : "إضافة المنتج"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
