import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { generateReceipt } from "@/utils/printingHelpers";
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
import { Sale, CartItem } from "@/types";
import { Search, Printer, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';

const Sales = () => {
  const { state } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Filter sales by date range
  const filterSalesByDateRange = (sales: Sale[], startDate: Date, endDate: Date): Sale[] => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };
  
  // فلترة المبيعات
  let filteredSales = [...state.sales];
  
  // فلترة بحسب التاريخ
  if (fromDate && toDate) {
    filteredSales = filterSalesByDateRange(filteredSales, fromDate, toDate);
  }
  
  // فلترة بحسب البحث
  if (searchQuery) {
    filteredSales = filteredSales.filter(
      (sale) =>
        sale.id.includes(searchQuery) ||
        sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerPhone?.includes(searchQuery)
    );
  }
  
  // إعادة طباعة الفاتورة
  const handlePrintReceipt = (sale: Sale) => {
    generateReceipt(sale, "نظام المبيعات")
      .then(() => console.log("Receipt generated successfully"))
      .catch(error => console.error("Error generating receipt:", error));
  };
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchQuery("");
    setFromDate(undefined);
    setToDate(undefined);
  };
  
  // رسم عناصر سلة المشتريات
  const renderCartItems = (items: CartItem[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead>الكمية</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>المجموع</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.product.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatCurrency(item.product.price)}</TableCell>
              <TableCell>
                {formatCurrency(item.product.price * item.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
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
        
        <div className="bg-card rounded-lg shadow dark:bg-gray-800">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              سجل المبيعات ({filteredSales.length})
            </h2>
          </div>
          
          {filteredSales.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredSales.map((sale) => (
                <AccordionItem value={sale.id} key={sale.id}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex flex-1 flex-col md:flex-row md:items-center md:justify-between text-right gap-2">
                      <div>
                        <span className="text-gray-500 ml-2">
                          #{sale.id.substring(0, 8)}
                        </span>
                        <span className="text-primary">
                          {formatCurrency(sale.finalTotal)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="ml-4">
                          {formatDate(sale.createdAt)}
                        </span>
                        {sale.customerName && (
                          <span>العميل: {sale.customerName}</span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {renderCartItems(sale.items)}
                      
                      <div className="bg-muted p-3 rounded-md mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">تفاصيل الفاتورة</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>المجموع:</span>
                                <span>{formatCurrency(sale.total)}</span>
                              </div>
                              
                              {sale.discount > 0 && (
                                <div className="flex justify-between">
                                  <span>الخصم:</span>
                                  <span>{formatCurrency(sale.discount)}</span>
                                </div>
                              )}
                              
                              {sale.tax > 0 && (
                                <div className="flex justify-between">
                                  <span>الضريبة ({sale.tax}%):</span>
                                  <span>
                                    {formatCurrency(
                                      (sale.total - sale.discount) * (sale.tax / 100)
                                    )}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex justify-between font-bold pt-1 border-t mt-1">
                                <span>الإجمالي:</span>
                                <span>{formatCurrency(sale.finalTotal)}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>طريقة الدفع:</span>
                                <span>
                                  {sale.paymentMethod === "cash"
                                    ? "نقداً"
                                    : sale.paymentMethod === "card"
                                    ? "بطاقة"
                                    : "أخرى"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">بيانات العميل</h4>
                            <div className="space-y-1 text-sm">
                              {sale.customerName ? (
                                <div className="flex justify-between">
                                  <span>الاسم:</span>
                                  <span>{sale.customerName}</span>
                                </div>
                              ) : (
                                <div className="text-gray-500">لا توجد بيانات للعميل</div>
                              )}
                              
                              {sale.customerPhone && (
                                <div className="flex justify-between">
                                  <span>رقم الهاتف:</span>
                                  <span>{sale.customerPhone}</span>
                                </div>
                              )}
                              
                              {sale.notes && (
                                <div className="flex justify-between">
                                  <span>ملاحظات:</span>
                                  <span>{sale.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintReceipt(sale)}
                        >
                          <Printer className="ml-2 h-4 w-4" />
                          طباعة الفاتورة
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
                لا توجد مبيعات متطابقة مع معايير البحث
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
