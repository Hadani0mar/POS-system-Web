
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { 
  formatCurrency, 
  calculateTotalSales, 
  getTodaySales,
  filterSalesByDateRange
} from "@/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  CreditCard, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  TrendingUp, 
  Package 
} from "lucide-react";

const Dashboard = () => {
  const { state } = useAppContext();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  
  // إحصائيات المبيعات
  const allSalesTotal = calculateTotalSales(state.sales);
  const todaySales = getTodaySales(state.sales);
  const todaySalesTotal = calculateTotalSales(todaySales);
  const totalProducts = state.products.length;
  const lowStockProducts = state.products.filter((product) => product.stock < 5).length;
  
  // تخصيص بيانات المخطط
  useEffect(() => {
    // بيانات المبيعات اليومية (آخر 7 أيام)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();
    
    const dailySales = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySales = filterSalesByDateRange(state.sales, date, nextDay);
      const total = calculateTotalSales(daySales);
      
      return {
        day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
        amount: total,
        count: daySales.length,
      };
    });
    
    setSalesData(dailySales);
    
    // بيانات المنتجات حسب الفئة
    const categories: Record<string, { total: number; count: number }> = {};
    
    // جمع بيانات المنتجات حسب الفئة
    state.products.forEach((product) => {
      if (!categories[product.category]) {
        categories[product.category] = { total: 0, count: 0 };
      }
      
      categories[product.category].count += 1;
      categories[product.category].total += product.price * product.stock;
    });
    
    // تحويل البيانات إلى تنسيق مناسب للرسم البياني
    const categoryChartData = Object.entries(categories).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.total,
    }));
    
    setCategoryData(categoryChartData);
  }, [state.sales, state.products]);
  
  // ألوان المخطط الدائري
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  // تنسيق تلميح الرسم البياني
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow rounded-md">
          <p className="font-semibold">{label}</p>
          <p>{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
          {payload[1] && <p>{`عدد المبيعات: ${payload[1].value}`}</p>}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(allSalesTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد الفواتير: {state.sales.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">مبيعات اليوم</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todaySalesTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد الفواتير: {todaySales.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                منتجات بمخزون منخفض: {lowStockProducts}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  state.products.reduce(
                    (total, product) => total + product.price * product.stock,
                    0
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                متوسط سعر المنتج: {' '}
                {formatCurrency(
                  state.products.length > 0
                    ? state.products.reduce((total, product) => total + product.price, 0) /
                      state.products.length
                    : 0
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* المخططات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* مخطط المبيعات اليومية */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات اليومية (آخر 7 أيام)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" name="المبيعات" fill="#3B82F6" />
                    <Bar dataKey="count" name="عدد الفواتير" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* مخطط المنتجات حسب الفئة */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'عدد المنتجات']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
