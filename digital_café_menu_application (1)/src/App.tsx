import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster, toast } from "sonner";
import { MenuPage } from "./components/MenuPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { OrderConfirmation } from "./components/OrderConfirmation";
import { QRCodePage } from "./components/QRCodePage";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'menu' | 'cart' | 'checkout' | 'confirmation' | 'qr' | 'admin-login' | 'admin-dashboard'>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  const initializeMenu = useMutation(api.menu.initializeMenu);

  useEffect(() => {
    // Initialize menu data
    initializeMenu().catch(console.error);

    // Check for table number in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
      const table = parseInt(tableParam);
      if (table > 0 && table <= 50) {
        setTableNumber(table);
      }
    } else {
      setShowTablePrompt(true);
    }
  }, [initializeMenu]);

  const addToCart = (item: MenuItem) => {
    if (!tableNumber) {
      setShowTablePrompt(true);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        }];
      }
    });
    toast.success(`${item.name} added to cart!`);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleTableNumberSubmit = (table: number) => {
    setTableNumber(table);
    setShowTablePrompt(false);
  };

  const handleOrderComplete = (details: any) => {
    setOrderDetails(details);
    setCurrentPage('confirmation');
    setCart([]);
  };

  const handleAdminLogin = (user: any) => {
    setAdminUser(user);
    setCurrentPage('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentPage('menu');
    setShowTablePrompt(true);
  };

  if (currentPage === 'admin-login') {
    return <AdminLogin onLogin={handleAdminLogin} onBack={() => setShowTablePrompt(true)} />;
  }

  if (currentPage === 'admin-dashboard' && adminUser) {
    return <AdminDashboard onLogout={handleAdminLogout} adminUser={adminUser} />;
  }

  if (showTablePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-800 mb-2">Welcome to CHA VALA</h1>
            <p className="text-gray-600">Please enter your table number to continue</p>
          </div>
          <TableNumberForm onSubmit={handleTableNumberSubmit} />
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => setCurrentPage('qr')}
              className="block w-full text-amber-600 hover:text-amber-800 text-sm underline"
            >
              Generate QR Code for Tables
            </button>
            <button
              onClick={() => setCurrentPage('admin-login')}
              className="block w-full text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Admin Login
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'qr') {
    return <QRCodePage onBack={() => setShowTablePrompt(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">☕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-800">CHA VALA</h1>
              {tableNumber && (
                <p className="text-sm text-gray-600">Table {tableNumber}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {cart.length > 0 && (
              <button
                onClick={() => setCurrentPage('cart')}
                className="relative bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors"
              >
                Cart ({cart.length})
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            )}
            <button
              onClick={() => setCurrentPage('admin-login')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {currentPage === 'menu' && (
          <MenuPage onAddToCart={addToCart} />
        )}
        {currentPage === 'cart' && (
          <CartPage
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={() => setCurrentPage('checkout')}
            onBack={() => setCurrentPage('menu')}
            totalAmount={getTotalAmount()}
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage
            cart={cart}
            tableNumber={tableNumber!}
            totalAmount={getTotalAmount()}
            onOrderComplete={handleOrderComplete}
            onBack={() => setCurrentPage('cart')}
          />
        )}
        {currentPage === 'confirmation' && orderDetails && (
          <OrderConfirmation
            orderDetails={orderDetails}
            onNewOrder={() => {
              setCurrentPage('menu');
              setOrderDetails(null);
            }}
          />
        )}
      </main>

      <Toaster />
    </div>
  );
}

function TableNumberForm({ onSubmit }: { onSubmit: (table: number) => void }) {
  const [table, setTable] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tableNum = parseInt(table);
    if (tableNum > 0 && tableNum <= 50) {
      onSubmit(tableNum);
    } else {
      toast.error('Please enter a valid table number (1-50)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table Number
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter table number (1-50)"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
      >
        Continue to Menu
      </button>
    </form>
  );
}
