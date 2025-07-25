
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription, 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency, calculateShiftSummary, getTodaySales } from "@/utils/helpers";
import { generateShiftReport } from "@/utils/printingHelpers";
import { Sale, ShiftReport as ShiftReportType, Expense } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ExpenseForm from "@/components/ExpenseForm";
import { ScrollArea } from "@/components/ui/scroll-area";

const ShiftEnd = () => {
  const { state } = useAppContext();
  const [cashInDrawer, setCashInDrawer] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [report, setReport] = useState<ShiftReportType | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [resetAlertOpen, setResetAlertOpen] = useState<boolean>(false);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [selectedPaidDebts, setSelectedPaidDebts] = useState<{[key: string]: boolean}>({});
  const [paidDebtsDialogOpen, setPaidDebtsDialogOpen] = useState<boolean>(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const navigate = useNavigate();
  
  // Get today's sales
  useEffect(() => {
    const sales = getTodaySales(state.sales);
    setTodaySales(sales);
  }, [state.sales]);
  
  // Get today's cash sales amount to compare with cash in drawer
  const summary = calculateShiftSummary(todaySales);
  
  // Calculate cash shortage (positive means excess, negative means shortage)
  const cashShortage = cashInDrawer - summary.totalCashSales;
  
  // Get today's paid debts 
  const todayPaidDebts = state.sales.filter(sale => 
    !sale.isDebt && // Is paid
    sale.debtorName && // Was a debt sale
    new Date(sale.updatedAt || sale.createdAt).toDateString() === new Date().toDateString() // Updated today
  );
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Toggle selected paid debts
  const togglePaidDebt = (saleId: string) => {
    setSelectedPaidDebts(prev => ({
      ...prev,
      [saleId]: !prev[saleId]
    }));
  };
  
  // Get selected paid debts
  const getSelectedPaidDebts = () => {
    return todayPaidDebts.filter(sale => selectedPaidDebts[sale.id]);
  };
  
  // Add expense
  const handleAddExpense = (expense: {amount: number, reason: string, date: Date}) => {
    const newExpense: Expense = {
      id: Math.random().toString(36).substring(2, 15),
      ...expense
    };
    
    setExpenses(prev => [...prev, newExpense]);
    setCashInDrawer(prev => prev - expense.amount);
    toast.success("تم إضافة المصروف بنجاح");
  };
  
  // Handle delete expense
  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setCashInDrawer(prev => prev + expense.amount);
      toast.success("تم حذف المصروف بنجاح");
    }
  };
  
  // Handle shift end confirmation
  const handleConfirm = () => {
    // Get selected paid debts
    const paidDebts = getSelectedPaidDebts();
    
    // Create shift report
    const newReport: ShiftReportType = {
      id: Math.random().toString(36).substring(2, 15),
      date: new Date(),
      salesCount: summary.salesCount,
      totalSales: summary.totalSales,
      totalCashSales: summary.totalCashSales,
      totalCardSales: summary.totalCardSales,
      totalDebtSales: summary.totalDebtSales,
      cashInDrawer: cashInDrawer,
      cashShortage: cashShortage,
      expenses: totalExpenses,
      paidDebts: paidDebts,
      notes: notes
    };
    
    setReport(newReport);
    setConfirmDialogOpen(false);
    setReportDialogOpen(true);
    
    // Save report to localStorage
    const savedReports = localStorage.getItem("shiftReports");
    const reports = savedReports ? JSON.parse(savedReports) : [];
    reports.push(newReport);
    localStorage.setItem("shiftReports", JSON.stringify(reports));
  };
  
  // Handle reset shift
  const handleResetShift = () => {
    setCashInDrawer(0);
    setNotes("");
    setSelectedPaidDebts({});
    setExpenses([]);
    setResetAlertOpen(false);
    toast.success("تم إعادة تعيين بيانات نهاية الدوام");
  };
  
  // Handle print report
  const handlePrintReport = async () => {
    if (report) {
      try {
        await generateShiftReport(report);
        setReportDialogOpen(false);
        navigate("/shift-reports");
      } catch (error) {
        console.error("Error generating shift report", error);
        toast.error("حدث خطأ أثناء طباعة التقرير");
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold mb-4">جرد نهاية الدوام</h1>
        <p className="text-muted-foreground">قم بإجراء تسوية الصندوق لنهاية الدوام وإنشاء تقرير</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-4">ملخص المبيعات</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>عدد المبيعات:</span>
                <span className="font-semibold">{summary.salesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي المبيعات:</span>
                <span className="font-semibold">{formatCurrency(summary.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>المبيعات النقدية:</span>
                <span className="font-semibold">{formatCurrency(summary.totalCashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>مبيعات البطاقات:</span>
                <span className="font-semibold">{formatCurrency(summary.totalCardSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>مبيعات الدين:</span>
                <span className="font-semibold">{formatCurrency(summary.totalDebtSales)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t mt-2">
                <span>ديون تم سدادها اليوم:</span>
                <span className="font-semibold">
                  {formatCurrency(todayPaidDebts.reduce((total, sale) => total + sale.finalTotal, 0))}
                </span>
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setPaidDebtsDialogOpen(true)}
                disabled={todayPaidDebts.length === 0}
              >
                تحديد الديون المسددة ({todayPaidDebts.length})
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-4">تسوية الصندوق</CardTitle>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cashInDrawer">النقد في الصندوق</Label>
                <Input
                  id="cashInDrawer"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashInDrawer}
                  onChange={(e) => setCashInDrawer(parseFloat(e.target.value) || 0)}
                  placeholder="أدخل المبلغ النقدي في الصندوق"
                  className="text-left"
                  dir="ltr"
                />
              </div>
              
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between">
                  <span>المتوقع في الصندوق:</span>
                  <span className="font-semibold">{formatCurrency(summary.totalCashSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>مصروفات المحل:</span>
                  <span className="font-semibold text-red-500">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-1">
                  <span>الفرق:</span>
                  <span className={`font-semibold ${cashShortage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {cashShortage >= 0 ? 'فائض: ' : 'عجز: '}
                    {formatCurrency(Math.abs(cashShortage))}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setExpenseFormOpen(true)}
              >
                سحب مصروفات من الصندوق
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="mb-4">مصروفات المحل</CardTitle>
            
            {expenses.length > 0 ? (
              <ScrollArea className="h-40 mb-4">
                <div className="space-y-2">
                  {expenses.map(expense => (
                    <div key={expense.id} className="p-2 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                        <div className="text-xs text-muted-foreground">{expense.reason}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد مصروفات مسجلة
              </div>
            )}
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setResetAlertOpen(true)}
                >
                  إعادة تعيين
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  إنهاء الدوام
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد إنهاء الدوام</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في إنهاء الدوام؟ سيتم إنشاء تقرير نهاية الدوام وحفظه.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>إجمالي المبيعات:</span>
                <span className="font-semibold">{formatCurrency(summary.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>النقد في الصندوق:</span>
                <span className="font-semibold">{formatCurrency(cashInDrawer)}</span>
              </div>
              <div className="flex justify-between">
                <span>الفرق:</span>
                <span className={`font-semibold ${cashShortage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {cashShortage >= 0 ? 'فائض: ' : 'عجز: '}
                  {formatCurrency(Math.abs(cashShortage))}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirm}>
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تقرير نهاية الدوام</DialogTitle>
            <DialogDescription>
              تم إنشاء تقرير نهاية الدوام بنجاح.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span>{report && new Date(report.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي المبيعات:</span>
                <span>{report && formatCurrency(report.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>النقد في الصندوق:</span>
                <span>{report && formatCurrency(report.cashInDrawer)}</span>
              </div>
              <div className="flex justify-between">
                <span>الفرق:</span>
                <span className={`${report && report.cashShortage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {report && (report.cashShortage >= 0 ? 'فائض: ' : 'عجز: ')}
                  {report && formatCurrency(Math.abs(report.cashShortage))}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={handlePrintReport}>
              طباعة التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Alert */}
      <AlertDialog open={resetAlertOpen} onOpenChange={setResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إعادة تعيين بيانات نهاية الدوام</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إعادة تعيين بيانات نهاية الدوام؟ سيتم مسح جميع البيانات المدخلة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetShift}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Paid Debts Dialog */}
      <Dialog open={paidDebtsDialogOpen} onOpenChange={setPaidDebtsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديد الديون المسددة</DialogTitle>
            <DialogDescription>
              اختر الديون التي تم سدادها وترغب في تضمينها في تقرير نهاية الدوام
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {todayPaidDebts.length > 0 ? (
                todayPaidDebts.map(sale => (
                  <div key={sale.id} className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox 
                      id={`debt-${sale.id}`} 
                      checked={selectedPaidDebts[sale.id] || false}
                      onCheckedChange={() => togglePaidDebt(sale.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`debt-${sale.id}`} className="cursor-pointer">
                        <div className="font-semibold">
                          {sale.debtorName} - {formatCurrency(sale.finalTotal)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          تاريخ السداد: {new Date(sale.updatedAt || sale.createdAt).toLocaleDateString()}
                        </div>
                      </Label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد ديون مسددة اليوم
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setPaidDebtsDialogOpen(false)}>
              تم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Expense Form */}
      <ExpenseForm 
        open={expenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        onAddExpense={handleAddExpense}
        currentCash={cashInDrawer}
      />
    </div>
  );
};

export default ShiftEnd;
