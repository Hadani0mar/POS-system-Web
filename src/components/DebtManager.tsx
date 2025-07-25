
import React, { useState } from "react";
import { Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/helpers";
import { AlertTriangle, CreditCard, Banknote } from "lucide-react";

interface DebtManagerProps {
  open: boolean;
  onClose: () => void;
  sale: Sale;
  onUpdate: (saleId: string, isFrozen: boolean) => void;
  onPayDebt: (saleId: string) => void;
}

const DebtManager: React.FC<DebtManagerProps> = ({
  open,
  onClose,
  sale,
  onUpdate,
  onPayDebt,
}) => {
  const [isFrozen, setIsFrozen] = useState(sale.isFrozen || false);
  
  const handleToggleFrozen = () => {
    setIsFrozen(!isFrozen);
  };
  
  const handleSave = () => {
    onUpdate(sale.id, isFrozen);
    onClose();
  };
  
  const handlePayDebt = () => {
    onPayDebt(sale.id);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إدارة الدين</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                  معلومات الدين
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  العميل: {sale.debtorName || sale.customerName}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  المبلغ المستحق: {formatCurrency(sale.finalTotal)}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  تاريخ الدين: {new Date(sale.createdAt).toLocaleDateString('ar-LY')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="frozen" className="text-gray-700 dark:text-gray-300">
              تجميد الدين (عدم عرضه في تقارير الديون المستحقة)
            </Label>
            <Switch 
              id="frozen" 
              checked={isFrozen} 
              onCheckedChange={handleToggleFrozen} 
            />
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2 dark:text-white">تصفية الدين</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              سيتم تحويل الدين إلى بيع مدفوع وإزالته من قائمة الديون.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handlePayDebt}
              >
                <Banknote className="ml-2 h-4 w-4" />
                دفع نقدي
              </Button>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handlePayDebt}
              >
                <CreditCard className="ml-2 h-4 w-4" />
                دفع ببطاقة
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebtManager;
