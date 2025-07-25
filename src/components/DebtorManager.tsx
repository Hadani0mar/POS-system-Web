
import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { formatCurrency, getAllDebtors, generateReceipt } from "@/utils/helpers";
import { Settings, defaultSettings } from "@/types/settings";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CreditCard, Banknote, Printer, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DebtorManagerProps {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
  onPayDebt: (saleId: string, paymentMethod: "cash" | "card") => void;
  onFreezeDebt: (saleId: string, isFrozen: boolean) => void;
}

const DebtorManager: React.FC<DebtorManagerProps> = ({
  open,
  onClose,
  sales,
  onPayDebt,
  onFreezeDebt,
}) => {
  const [debtors, setDebtors] = useState<any[]>([]);
  const [expandedDebtor, setExpandedDebtor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Get settings
  const savedSettings = localStorage.getItem("settings");
  const settings: Settings = savedSettings 
    ? JSON.parse(savedSettings)
    : defaultSettings;
  
  useEffect(() => {
    if (open) {
      const allDebtors = getAllDebtors(sales);
      setDebtors(allDebtors);
    }
  }, [open, sales]);
  
  const handleExpandDebtor = (debtorName: string) => {
    setExpandedDebtor(expandedDebtor === debtorName ? null : debtorName);
  };
  
  const handlePayDebt = (saleId: string, method: "cash" | "card") => {
    onPayDebt(saleId, method);
    toast.success("تم تسجيل سداد الدين بنجاح");
  };
  
  const handleFreezeDebt = (saleId: string, isFrozen: boolean) => {
    onFreezeDebt(saleId, isFrozen);
    toast.success(isFrozen ? "تم تجميد الدين بنجاح" : "تم إلغاء تجميد الدين بنجاح");
  };
  
  const handlePrintReceipt = (sale: Sale) => {
    generateReceipt(sale);
  };
  
  // Filter debtors by search query
  const filteredDebtors = debtors.filter(debtor => 
    debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if debtor is authorized and has limit
  const getDebtorLimit = (debtorName: string) => {
    const authorizedDebtor = settings.authorizedDebtors.find(
      d => d.name === debtorName
    );
    return authorizedDebtor?.limit || 0;
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">إدارة الديون</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="relative">
            <Input
              placeholder="ابحث عن مدين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
          </div>
          
          {filteredDebtors.length > 0 ? (
            <div className="space-y-4">
              {filteredDebtors.map((debtor) => (
                <div key={debtor.name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="bg-muted p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => handleExpandDebtor(debtor.name)}
                  >
                    <div>
                      <h3 className="font-semibold">{debtor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        إجمالي الدين: {formatCurrency(debtor.totalDebt)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getDebtorLimit(debtor.name) > 0 && debtor.totalDebt >= getDebtorLimit(debtor.name) && (
                        <div className="flex items-center text-red-500 ml-2">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">تجاوز الحد</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        {expandedDebtor === debtor.name ? "إخفاء" : "عرض"} التفاصيل
                      </Button>
                    </div>
                  </div>
                  
                  {expandedDebtor === debtor.name && (
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {debtor.sales.map((sale: Sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>{new Date(sale.createdAt).toLocaleDateString('ar-LY')}</TableCell>
                              <TableCell>{formatCurrency(sale.finalTotal)}</TableCell>
                              <TableCell>
                                {sale.isFrozen ? (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    مجمد
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs">
                                    مستحق
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePrintReceipt(sale)}
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleFreezeDebt(sale.id, !sale.isFrozen)}
                                  >
                                    {sale.isFrozen ? "إلغاء التجميد" : "تجميد"}
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handlePayDebt(sale.id, "cash")}
                                  >
                                    <Banknote className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePayDebt(sale.id, "card")}
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد ديون مسجلة</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebtorManager;
