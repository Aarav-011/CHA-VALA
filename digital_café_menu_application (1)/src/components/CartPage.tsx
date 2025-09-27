import { CartItem } from "../App";

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  totalAmount: number;
}

export function CartPage({ cart, onUpdateQuantity, onCheckout, onBack, totalAmount }: CartPageProps) {
  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
        <button
          onClick={onBack}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-800">Your Order</h2>
        <button
          onClick={onBack}
          className="text-amber-600 hover:text-amber-800 font-medium"
        >
          ← Continue Shopping
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>

        <div className="p-6 bg-amber-50">
          <div className="flex justify-between items-center text-xl font-bold text-amber-800">
            <span>Total Amount:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-amber-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-700 transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

function CartItemRow({ item, onUpdateQuantity }: { 
  item: CartItem; 
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=${encodeURIComponent(item.name.charAt(0))}`;
          }}
        />
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
        <p className="text-amber-600 font-medium">₹{item.price}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center text-white"
        >
          +
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
      </div>
    </div>
  );
}
