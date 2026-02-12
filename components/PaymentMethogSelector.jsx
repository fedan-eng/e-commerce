// components/PaymentMethodSelector.jsx
"use client";

export default function PaymentMethodSelector({ onSelect, selected }) {
  const paymentMethods = [
    {
      id: "paystack",
      name: "Paystack",
      description: "Pay with Card, Bank Transfer, USSD",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4z" className="text-blue-600" />
        </svg>
      ),
    },
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Pay with Card, Mobile Money, Bank Transfer",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4z" className="text-orange-500" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`
            border-2 rounded-lg p-4 cursor-pointer transition-all
            ${
              selected === method.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }
          `}
        >
          <div className="flex items-center gap-4">
            {/* Radio button */}
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected === method.id
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selected === method.id && (
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                )}
              </div>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">{method.icon}</div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{method.name}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}