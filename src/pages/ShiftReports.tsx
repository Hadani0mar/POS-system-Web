
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { formatCurrency, formatDate, getShiftReportsByDateRange, generateShiftReport } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Printer, Calendar as CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';
import { ShiftReport } from "@/types";

const ShiftReports = () => {
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Load reports from localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem("shiftReports");
    if (savedReports) {
      const parsedReports = JSON.parse(savedReports);
      // Convert string dates to Date objects
      const reportsWithDates = parsedReports.map((report: any) => ({
        ...report,
        date: new Date(report.date)
      }));
      setReports(reportsWithDates);
    }
  }, []);
  
  // Filter reports
  let filteredReports = [...reports];
  
  // Filter by date range
  if (fromDate && toDate) {
    filteredReports = getShiftReportsByDateRange(filteredReports, fromDate, toDate);
  }
  
  // Filter by search query
  if (searchQuery) {
    filteredReports = filteredReports.filter(
      (report) => report.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Calculate totals
  const calculateTotals = () => {
    return filteredReports.reduce(
      (acc, report) => {
        acc.totalSales += report.totalSales;
        acc.totalCashSales += report.totalCashSales;
        acc.totalCardSales += report.totalCardSales;
        acc.totalDebtSales += report.totalDebtSales;
        acc.cashShortage += report.cashShortage;
        return acc;
      },
      {
        totalSales: 0,
        totalCashSales: 0,
        totalCardSales: 0,
        totalDebtSales: 0,
        cashShortage: 0
      }
    );
  };
  
  const totals = calculateTotals();
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFromDate(undefined);
    setToDate(undefined);
  };
  
  // Print report
  const handlePrintReport = (report: ShiftReport) => {
    generateShiftReport(report);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="glass rounded-xl p-4 mb-6">
          <h1 className="text-2xl font-bold mb-4">سجل تقارير نهاية الدوام</h1>
          <p className="text-muted-foreground">متابعة وتحليل تقارير نهاية الدوام</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث في الملاحظات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {fromDate ? format(fromDate, 'dd/MM/yyyy') : 'من تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {toDate ? format(toDate, 'dd/MM/yyyy') : 'إلى تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" onClick={resetFilters} size="sm">
              إعادة تعيين
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إجمالي المبيعات</CardTitle>
              <CardDescription>مجموع كل التقارير</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totals.totalSales)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">المبيعات النقدية</CardTitle>
              <CardDescription>مجموع المبيعات النقدية</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totals.totalCashSales)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">فائض/عجز الصندوق</CardTitle>
              <CardDescription>صافي الفرق في النقد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${totals.cashShortage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(Math.abs(totals.cashShortage))}
                </p>
                {totals.cashShortage >= 0 ? 
                  <TrendingUp className="ml-2 text-green-500" /> : 
                  <TrendingDown className="ml-2 text-red-500" />
                }
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              قائمة التقارير ({filteredReports.length})
            </h2>
          </div>
          
          {filteredReports.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredReports.map((report) => (
                <AccordionItem value={report.id} key={report.id}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex flex-1 flex-col md:flex-row md:items-center md:justify-between text-right gap-2">
                      <div>
                        <span className="text-gray-500 ml-2">
                          {format(new Date(report.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-primary">
                          {formatCurrency(report.totalSales)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="ml-4">
                          عدد المبيعات: {report.salesCount}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.cashShortage === 0 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : report.cashShortage > 0 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {report.cashShortage === 0 
                            ? "متطابق" 
                            : report.cashShortage > 0 
                              ? `فائض: ${formatCurrency(report.cashShortage)}`
                              : `عجز: ${formatCurrency(Math.abs(report.cashShortage))}`}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">تفاصيل المبيعات</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>المبيعات النقدية:</span>
                              <span>{formatCurrency(report.totalCashSales)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مبيعات البطاقات:</span>
                              <span>{formatCurrency(report.totalCardSales)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>مبيعات الدين:</span>
                              <span>{formatCurrency(report.totalDebtSales)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-1 border-t mt-1">
                              <span>الإجمالي:</span>
                              <span>{formatCurrency(report.totalSales)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">تسوية الصندوق</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>النقد في الصندوق:</span>
                              <span>{formatCurrency(report.cashInDrawer)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>المبلغ المتوقع:</span>
                              <span>{formatCurrency(report.totalCashSales)}</span>
                            </div>
                            <div className={`flex justify-between font-bold pt-1 border-t mt-1 ${
                              report.cashShortage === 0 
                                ? "text-green-600 dark:text-green-400" 
                                : report.cashShortage > 0 
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-red-600 dark:text-red-400"
                            }`}>
                              <span>{report.cashShortage >= 0 ? 'الفائض:' : 'العجز:'}</span>
                              <span>{formatCurrency(Math.abs(report.cashShortage))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {report.notes && (
                        <div className="bg-muted p-3 rounded-md">
                          <h4 className="font-semibold mb-1">ملاحظات:</h4>
                          <p className="text-sm">{report.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintReport(report)}
                        >
                          <Printer className="ml-2 h-4 w-4" />
                          طباعة التقرير
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                لا توجد تقارير متطابقة مع معايير البحث
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShiftReports;
