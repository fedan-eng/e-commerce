import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const BuyNow = ({ product, className }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  const router = useRouter();

  const handleBuyNow = async () => {
    // 1. Requirement: Must be logged in
    // if (!user) {
    //   alert("Please login to use Buy Now.");
    //   router.push('/login');
    //   return;
    // }

    // 2. Requirement: Check if essential delivery info is present
    const hasRequiredInfo = 
      user.firstName && 
      user.phone && 
      user.address && 
      user.region?.name && 
      user.region?.fee !== undefined;

    if (!hasRequiredInfo) {
      const goToProfile = window.confirm(
        "Your delivery details (phone, address, or region) are incomplete. Go to your profile to update them?"
      );
      if (goToProfile) {
        router.push('/profile');
      }
      return;
    }

    setLoading(true);

    try {
      const payload = {
        cartItems: [{
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }],
        deliveryInfo: {
          firstName: user.firstName,
          email: user.email,
          phone: user.phone,
          addPhone: user.addPhone || "",
          region: user.region, // Passes the {name, fee} object directly
          city: user.city || "",
          address: user.address,
          deliveryType: user.deliveryType || "Regular",
        },
        discount: 0,
        promoCode: null,
      };

      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.message || "Failed to start payment.");
      }
    } catch (err) {
      console.error("BuyNow Error:", err);
      alert("A connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={loading}
      className={className}
    >
      {loading ? "Redirecting..." : "Buy Now"}
    </button>
  );
};

export default BuyNow;