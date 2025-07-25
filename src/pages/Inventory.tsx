
import React, { useState } from "react";
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import { useAppContext } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/utils/helpers";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types";
import { Search, Plus, MoreVertical, Edit, Trash } from "lucide-react";

const Inventory = () => {
  const { state, addProduct, updateProduct, deleteProduct } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // البحث في المنتجات
  const filteredProducts = state.products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.includes(searchQuery) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // فتح نموذج إضافة منتج جديد
  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };
  
  // فتح نموذج تعديل منتج
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };
  
  // حذف منتج
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteProduct(productId);
    }
  };
  
  // إرسال نموذج إضافة منتج
  const handleAddProductSubmit = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    addProduct(productData);
    setIsAddProductOpen(false);
  };
  
  // إرسال نموذج تعديل منتج
  const handleEditProductSubmit = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (selectedProduct) {
      updateProduct({
        ...selectedProduct,
        ...productData,
      });
      setIsEditProductOpen(false);
      setSelectedProduct(null);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <Button onClick={handleAddProduct}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>تاريخ التحديث</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.cost ? formatCurrency(product.cost) : "غير محدد"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.stock <= 0
                              ? "text-destructive"
                              : product.stock < 5
                              ? "text-orange-500"
                              : "text-green-600"
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(product.updatedAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {state.products.length === 0
                        ? "لا توجد منتجات. أضف منتجات لتظهر هنا."
                        : "لا توجد منتجات متطابقة مع البحث"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* نموذج إضافة منتج */}
      <ProductForm
        open={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProductSubmit}
      />
      
      {/* نموذج تعديل منتج */}
      {selectedProduct && (
        <ProductForm
          open={isEditProductOpen}
          onClose={() => {
            setIsEditProductOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleEditProductSubmit}
          initialData={selectedProduct}
        />
      )}
    </Layout>
  );
};

export default Inventory;
