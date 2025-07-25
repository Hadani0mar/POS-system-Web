
import React from "react";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            المخزون: {product.stock}
          </span>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full mt-3"
          disabled={product.stock <= 0}
          size="sm"
        >
          <Plus className="ml-2 w-4 h-4" />
          إضافة
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
