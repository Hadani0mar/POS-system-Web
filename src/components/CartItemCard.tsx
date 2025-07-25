
import React, { useState } from "react";
import { CartItem } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Plus, Minus } from "lucide-react";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < item.product.stock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };
  
  const handleRemove = () => {
    onRemove(item.product.id);
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div className="flex-1">
        <p className="font-semibold">{item.product.name}</p>
        <p className="text-sm text-gray-500">
          {formatCurrency(item.product.price)} × {item.quantity}
        </p>
      </div>
      
      <div className="flex items-center gap-1 mx-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={decrementQuantity}
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Input
          type="number"
          min="1"
          max={item.product.stock}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-12 h-7 text-center"
        />
        
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={incrementQuantity}
          disabled={quantity >= item.product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <p className="font-bold text-primary">
          {formatCurrency(item.product.price * item.quantity)}
        </p>
        
        <Button variant="ghost" size="icon" onClick={handleRemove}>
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemCard;
