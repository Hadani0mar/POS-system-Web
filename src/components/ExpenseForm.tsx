
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/helpers";
import { toast } from "sonner";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onAddExpense: (expense: {amount: number, reason: string, date: Date}) => void;
  currentCash: number;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  onAddExpense,
  currentCash
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    if (amount > currentCash) {
      toast.error("المبلغ المطلوب أكبر من النقد المتوفر في الصندوق");
      return;
    }
    
    onAddExpense({
      amount,
      reason,
      date: new Date()
    });
    
    // Reset form
    setAmount(0);
    setReason("");
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">سحب مصروفات من الصندوق</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              placeholder="أدخل المبلغ"
              className="text-left"
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground">
              النقد المتاح: {formatCurrency(currentCash)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">سبب السحب</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أدخل سبب سحب المبلغ"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              سحب المبلغ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;
