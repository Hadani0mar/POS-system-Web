
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { exportDataToJson, importDataFromJson } from "@/utils/helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Save, Upload, Download, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { defaultSettings } from "@/types/settings";

const Settings = () => {
  const { state } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("settings");
    return savedSettings ? JSON.parse(savedSettings) : {
      businessName: defaultSettings.businessName,
      receiptFooter: defaultSettings.receiptFooter,
      location: defaultSettings.location,
      shouldApplyTax: defaultSettings.shouldApplyTax,
      authorizedDebtors: defaultSettings.authorizedDebtors
    };
  });
  
  // State for new debtor form
  const [newDebtor, setNewDebtor] = useState({
    name: "",
    phone: "",
    limit: "",
    notes: ""
  });
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);
  
  // Handle settings changes
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Save receipt settings
  const saveReceiptSettings = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    toast.success("تم حفظ إعدادات الفاتورة بنجاح");
  };
  
  // Add new authorized debtor
  const addAuthorizedDebtor = () => {
    if (!newDebtor.name) {
      toast.error("يرجى إدخال اسم المدين");
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      authorizedDebtors: [
        ...prev.authorizedDebtors,
        {
          name: newDebtor.name,
          phone: newDebtor.phone || undefined,
          limit: newDebtor.limit ? Number(newDebtor.limit) : undefined,
          notes: newDebtor.notes || undefined
        }
      ]
    }));
    
    // Reset form
    setNewDebtor({
      name: "",
      phone: "",
      limit: "",
      notes: ""
    });
    
    toast.success("تمت إضافة المدين بنجاح");
  };
  
  // Remove authorized debtor
  const removeAuthorizedDebtor = (index: number) => {
    setSettings(prev => ({
      ...prev,
      authorizedDebtors: prev.authorizedDebtors.filter((_, i) => i !== index)
    }));
    toast.success("تمت إزالة المدين بنجاح");
  };
  
  // Export data
  const handleExportData = () => {
    try {
      exportDataToJson({
        products: state.products,
        sales: state.sales,
        settings: settings
      });
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  };
  
  // Import data
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const data = await importDataFromJson(file);
        
        // Save the imported data to localStorage
        if (data.products) localStorage.setItem("products", JSON.stringify(data.products));
        if (data.sales) localStorage.setItem("sales", JSON.stringify(data.sales));
        
        // Save the settings if available
        if (data.settings) {
          localStorage.setItem("settings", JSON.stringify(data.settings));
          setSettings(data.settings);
        }
        
        toast.success("تم استيراد البيانات بنجاح. يرجى تحديث الصفحة لتطبيق التغييرات.");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("حدث خطأ أثناء استيراد البيانات");
      }
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto mb-16">
        <div className="glass rounded-xl p-4 mb-6">
          <h1 className="text-2xl font-bold mb-4">إعدادات نورا للمنظفات</h1>
          <p className="text-muted-foreground">تخصيص إعدادات النظام والفواتير والنسخ الاحتياطي</p>
        </div>
        
        <Tabs defaultValue="general" className="mb-20">
          <TabsList className="mb-4">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="receipt">الفواتير</TabsTrigger>
            <TabsTrigger value="debtors">المدينين</TabsTrigger>
            <TabsTrigger value="inventory">الجرد</TabsTrigger>
            <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إعدادات المظهر والتخصيص</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الوضع الليلي</Label>
                    <p className="text-sm text-muted-foreground">تبديل بين الوضع الليلي والنهاري</p>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Sun size={18} className={theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'} />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="receipt" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الفواتير</CardTitle>
                <CardDescription>تخصيص معلومات الفواتير</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">اسم المتجر / الشركة</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={settings.businessName}
                    onChange={handleSettingChange}
                    placeholder="أدخل اسم المتجر أو الشركة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    name="location"
                    value={settings.location}
                    onChange={handleSettingChange}
                    placeholder="أدخل موقع المتجر"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">تذييل الفاتورة</Label>
                  <Input
                    id="receiptFooter"
                    name="receiptFooter"
                    value={settings.receiptFooter}
                    onChange={handleSettingChange}
                    placeholder="أدخل نص تذييل الفاتورة"
                  />
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse pt-2">
                  <Switch
                    id="shouldApplyTax"
                    name="shouldApplyTax"
                    checked={settings.shouldApplyTax}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, shouldApplyTax: checked }))
                    }
                  />
                  <Label htmlFor="shouldApplyTax">تطبيق الضريبة على الفواتير</Label>
                </div>
                
                <Button onClick={saveReceiptSettings} className="mt-4 w-full">
                  <Save className="ml-2" size={18} />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="debtors" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المدينين</CardTitle>
                <CardDescription>الأشخاص المسموح لهم بالشراء بالدين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-medium">إضافة مدين جديد</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="debtorName">اسم المدين*</Label>
                    <Input
                      id="debtorName"
                      value={newDebtor.name}
                      onChange={(e) => setNewDebtor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="أدخل اسم المدين"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="debtorPhone">رقم الهاتف</Label>
                    <Input
                      id="debtorPhone"
                      value={newDebtor.phone}
                      onChange={(e) => setNewDebtor(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="debtorLimit">الحد الأقصى للدين (اختياري)</Label>
                    <Input
                      id="debtorLimit"
                      type="number"
                      value={newDebtor.limit}
                      onChange={(e) => setNewDebtor(prev => ({ ...prev, limit: e.target.value }))}
                      placeholder="أدخل الحد الأقصى للدين"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="debtorNotes">ملاحظات</Label>
                    <Input
                      id="debtorNotes"
                      value={newDebtor.notes}
                      onChange={(e) => setNewDebtor(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="أدخل ملاحظات إضافية"
                    />
                  </div>
                  
                  <Button onClick={addAuthorizedDebtor} className="w-full">
                    <UserPlus className="ml-2" size={18} />
                    إضافة مدين
                  </Button>
                </div>
                
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">قائمة المدينين المعتمدين</h3>
                  
                  {settings.authorizedDebtors.length > 0 ? (
                    <div className="space-y-3">
                      {settings.authorizedDebtors.map((debtor, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold">{debtor.name}</p>
                            {debtor.phone && <p className="text-sm text-muted-foreground">{debtor.phone}</p>}
                            {debtor.limit && <p className="text-sm">الحد: {debtor.limit} د.ل</p>}
                            {debtor.notes && <p className="text-sm text-muted-foreground">{debtor.notes}</p>}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeAuthorizedDebtor(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">لا يوجد مدينين معتمدين حالياً</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>جرد نهاية الدوام</CardTitle>
                <CardDescription>مراقبة المخزون والعجز النقدي في نهاية الدوام</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4">
                  يمكنك إجراء جرد في نهاية الدوام للتأكد من تطابق المخزون الفعلي مع ما هو مسجل في النظام
                </p>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = "/shift-end"}
                >
                  بدء جرد نهاية الدوام
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
                <CardDescription>تصدير واستيراد بيانات النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تصدير البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    قم بتصدير جميع بيانات النظام (المنتجات، المبيعات، الإعدادات) إلى ملف JSON
                  </p>
                  <Button onClick={handleExportData} className="w-full">
                    <Download className="ml-2" size={18} />
                    تصدير البيانات
                  </Button>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Label>استيراد البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    استعادة البيانات من نسخة احتياطية سابقة
                  </p>
                  <div className="flex items-center">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      id="importFile"
                      className="hidden"
                    />
                    <Button asChild className="w-full">
                      <label htmlFor="importFile" className="cursor-pointer flex items-center justify-center">
                        <Upload className="ml-2" size={18} />
                        استيراد البيانات
                      </label>
                    </Button>
                  </div>
                  <p className="text-xs text-destructive mt-2">
                    ملاحظة: استيراد البيانات سيستبدل البيانات الحالية. يرجى عمل نسخة احتياطية قبل الاستيراد.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
