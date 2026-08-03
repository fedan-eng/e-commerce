import React from 'react';

const BuyNow = ({ product, className, onBuyNow }) => {
  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  if (!product?.availability) {
    return null;
  }

  return (
    <button
      onClick={handleBuyNow}
      className={`${className} cursor-pointer`}
    >
      Checkout Now
    </button>
  );
};

export default BuyNow; 