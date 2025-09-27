interface OrderConfirmationProps {
  orderDetails: any;
  onNewOrder: () => void;
}

export function OrderConfirmation({ orderDetails, onNewOrder }: OrderConfirmationProps) {
  // Calculate GST details
  const gstRate = 0.18;
  const netAmount = Math.round((orderDetails.totalAmount / (1 + gstRate)) * 100) / 100;
  const gstAmount = Math.round((orderDetails.totalAmount - netAmount) * 100) / 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        
        <h2 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-4">Order Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-600">Order ID:</p>
              <p className="font-medium">{orderDetails.orderId}</p>
            </div>
            <div>
              <p className="text-gray-600">Customer:</p>
              <p className="font-medium">{orderDetails.customerName}</p>
            </div>
            <div>
              <p className="text-gray-600">Table:</p>
              <p className="font-medium">{orderDetails.tableNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Type:</p>
              <p className="font-medium capitalize">{orderDetails.orderType.replace('-', ' ')}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Items Ordered:</h4>
            <div className="space-y-2">
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Net Amount:</span>
              <span>₹{netAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%):</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid:</span>
              <span>₹{orderDetails.totalAmount}</span>
            </div>
          </div>

          {orderDetails.paymentId && (
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-gray-600">
                Payment ID: {orderDetails.paymentId}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Your order is being prepared</p>
            <p>• Estimated preparation time: 15-20 minutes</p>
            <p>• You'll be notified when your order is ready</p>
          </div>
        </div>

        <button
          onClick={onNewOrder}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Place New Order
        </button>
      </div>
    </div>
  );
}
