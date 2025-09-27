import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CartItem } from "../App";
import { toast } from "sonner";

interface CheckoutPageProps {
  cart: CartItem[];
  tableNumber: number;
  totalAmount: number;
  onOrderComplete: (orderDetails: any) => void;
  onBack: () => void;
}

export function CheckoutPage({ cart, tableNumber, totalAmount, onOrderComplete, onBack }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    orderType: 'dine-in' as 'dine-in' | 'takeaway',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = useMutation(api.orders.createOrder);
  const createPaytmOrder = useAction(api.payments.createPaytmOrder);

  // Calculate GST (18% for restaurant services in India)
  const gstRate = 0.18;
  const netAmount = Math.round((totalAmount / (1 + gstRate)) * 100) / 100;
  const gstAmount = Math.round((totalAmount - netAmount) * 100) / 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePayment = async (orderId: string) => {
    try {
      const paytmOrder = await createPaytmOrder({
        amount: totalAmount,
        orderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      // Create a form and submit to Paytm
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paytmOrder.paymentUrl;

      // Add all Paytm parameters as hidden inputs
      Object.entries(paytmOrder.paytmParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      // Add checksum
      const checksumInput = document.createElement('input');
      checksumInput.type = 'hidden';
      checksumInput.name = 'CHECKSUMHASH';
      checksumInput.value = paytmOrder.checksum;
      form.appendChild(checksumInput);

      document.body.appendChild(form);
      form.submit();
      
      return true;
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order first
      const orderResult = await createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        tableNumber,
        orderType: formData.orderType,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        gstAmount,
        netAmount,
      });

      // Initiate payment
      const paymentSuccess = await handlePayment(orderResult.orderId);
      if (!paymentSuccess) {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-800">Checkout</h2>
        <button
          onClick={onBack}
          className="text-amber-600 hover:text-amber-800 font-medium"
        >
          ← Back to Cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 mt-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Net Amount:</span>
              <span>₹{netAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>GST (18%):</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-amber-800">
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Table:</strong> {tableNumber}
            </p>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type
              </label>
              <select
                name="orderType"
                value={formData.orderType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="dine-in">Dine In</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Paytm Payment Options</h4>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <span className="flex items-center gap-1">
                  📱 UPI
                </span>
                <span className="flex items-center gap-1">
                  💳 Cards
                </span>
                <span className="flex items-center gap-1">
                  🏦 Net Banking
                </span>
                <span className="flex items-center gap-1">
                  💰 Paytm Wallet
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₹${totalAmount} via Paytm`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Powered by Paytm • Your payment information is secure and encrypted
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
