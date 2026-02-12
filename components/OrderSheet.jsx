"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import { AiOutlineExclamation } from "react-icons/ai";
import { formatAmount } from "lib/utils";
import AddToCartButton from "./AddToCart";
import OrderProgressBar from "@/components/OrderTracking";
import { MdNavigateNext } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import Link from "next/link";

export default function OrderSheet() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [returningProduct, setReturningProduct] = useState(null);

  const limit = 10;

  useEffect(() => {
    if (selectedOrder) return;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/orders?page=${page}&limit=${limit}`);
        setItems(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [page, selectedOrder]);

  // Utility function: get +7 days from a status
  function getEstimatedDate(statusHistory, status = "Delivered") {
    if (!Array.isArray(statusHistory)) return null;

    // Find the first matching status or fall back to last history item
    const entry =
      statusHistory.find((h) => h.status === status) ||
      statusHistory[statusHistory.length - 1];

    if (!entry?.date) return null;

    const d = new Date(entry.date);
    d.setDate(d.getDate() + 7); // add 7 days
    return d.toLocaleDateString(); // format as string
  }

  const handleViewOrder = async (orderId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(res.data.order);
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setReturningProduct(null);
    setActiveTab("details");
  };

  const [formData, setFormData] = useState({
    productCondition: "",
    returnQuantity: "",
    reasonForReturn: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [isloading, isSetLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Merge user input with order details
      const payload = {
        ...formData,
        amount: selectedOrder.total,
        address: selectedOrder.address,
        region: selectedOrder.region,
        city: selectedOrder.city,
        phone: selectedOrder.phone,
        orderId: selectedOrder._id,
        productName: returningProduct.name,
        productPrice: returningProduct.price,
      };

      const res = await axios.post("/api/returns", payload);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="justify-center gap-4">
        <div className="order-1 mb-10 px-2 lg:px-6 pb-4 sm:pb-10 border border-[#e3e3e3] rounded-md w-full max-w-[851px]">
          {!loading && !selectedOrder && (
            <>
              <div className="flex justify-between items-center mb-8 py-4 border-[#e3e3e3] border-b">
                <h2 className="font-oswald text-2xl">Orders</h2>
                <p className="text-[#767676] text-xs">{total} results</p>
              </div>

              {/* Order list */}
              <div className="">
                <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(0px,1fr)_90px] lg:grid-cols-[30px_minmax(120px,1fr)_100px_40px_60px_120px] nav:grid-cols-[30px_minmax(120px,1fr)_80px_40px_60px_100px] s:grid-cols-[20px_minmax(50px,1fr)_30px_60px_90px] bg-[#f2f2f2] max-s:px-2 py-2 border-[#e5e5e5] rounded-md">
                  <span className="max-s:hidden font-medium text-sm text-center">
                    #
                  </span>
                  <span className="font-medium text-sm">PRODUCT</span>
                  <span className="max-nav:hidden font-medium text-sm text-center whitespace-nowrap">
                    ORDERED ON
                  </span>
                  <span className="max-s:hidden font-medium text-sm text-center">
                    QTY
                  </span>
                  <span className="max-s:hidden font-medium text-sm text-center">
                    PRICE
                  </span>
                  <span className="font-medium text-sm"></span>
                </div>
                <div className="overflow-hidden">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        key={index}
                        className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(0px,1fr)_90px] lg:grid-cols-[30px_minmax(120px,1fr)_100px_40px_60px_120px] nav:grid-cols-[30px_minmax(120px,1fr)_80px_40px_60px_100px] s:grid-cols-[20px_minmax(50px,1fr)_30px_60px_90px] bg-[#fafafa] my-2 p-2 rounded-md text-sm sm:text-base"
                      >
                        <span className="max-s:hidden text-sm text-center">
                          {(page - 1) * limit + index + 1}
                        </span>

                        <div className="flex items-center gap-1 nav:gap-3">
                          <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] tab:w-[72px] h-[50px] tab:h-[72px]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-[40px] tab:w-[56px] h-[40px] tab:h-[56px] object-contain"
                            />
                          </div>
                          <div className="">
                            <p className="min-w-0 text-xs break-all line-clamp-1">
                              {item.orderId}{" "}
                            </p>
                            <p className="my-1 font-oswald text-sm line-clamp-1">
                              {item.name}
                            </p>
                            <p className="inline-block bg-[#dcf3de] px-2 py-1 rounded-md text-[#007c42] text-[10px]">
                              {item.status}
                            </p>
                          </div>
                        </div>

                        <div className="max-nav:hidden text-dark text-sm text-center">
                          {new Date(item.orderDate).toLocaleDateString()}
                        </div>

                        <div className="max-s:hidden text-dark text-sm text-center">
                          {item.quantity}
                        </div>
                        <div className="max-s:hidden text-dark text-sm">
                          {formatAmount(item.price)}
                        </div>

                        <div className="w-full overflow-hidden">
                          <AddToCartButton
                            className="bg-filgreen px-2 lg:px-6 py-2 rounded-md w-full font-medium text-dark text-xs s:text-sm cursor-pointer"
                            product={item}
                          />

                          <button
                            onClick={() => handleViewOrder(item.orderId)}
                            className="mt-2 px-2 lg:px-4 py-2 border border-[#d9d9d9] rounded-md w-full font-medium text-filgreen text-xs s:text-sm whitespace-nowrap cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div className="p-4 text-center">No orders found.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex flex-nowrap justify-center items-center gap-1 xs:gap-3 mx-auto mt-4 w-full max-w-[400px]">
                {/* Jump Back 2 */}
                <button
                  disabled={page <= 2}
                  onClick={() => setPage((prev) => Math.max(1, prev - 2))}
                  className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded-md whitespace-nowrap rotate-180 cursor-pointer disabled:cursor-default shrink-0"
                >
                  <MdKeyboardDoubleArrowRight />
                </button>

                {/* Previous */}
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded rotate-180 cursor-pointer disabled:cursor-default shrink-0"
                >
                  <MdNavigateNext />
                </button>

                {/* Page Numbers with Ellipses */}
                <div className="flex flex-nowrap items-center gap-2 shrink">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((num) => {
                      // Always show first, last, current, and neighbors
                      return (
                        num === 1 ||
                        num === totalPages ||
                        num === page ||
                        num === page - 1 ||
                        num === page + 1
                      );
                    })
                    .reduce((acc, num, idx, arr) => {
                      // Insert ellipses where gaps exist
                      if (idx > 0 && num - arr[idx - 1] > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(num);
                      return acc;
                    }, [])
                    .map((item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`px-[6px] s:px-[14px] py-2 text-xs rounded-md shrink-0 ${
                            page === item
                              ? "bg-black text-white"
                              : "hover:bg-[#e7e7e7] cursor-pointer"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                {/* Next */}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0"
                >
                  <MdNavigateNext />
                </button>

                {/* Jump Forward 2 */}
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 2))
                  }
                  className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0"
                >
                  <MdKeyboardDoubleArrowRight />
                </button>
              </div>
            </>
          )}

          {/* ORDER DETAILS */}
          {!loading && selectedOrder && !returningProduct && (
            <>
              <div className="flex justify-between items-center border-[#e3e3e3] border-b">
                <h2 className="max-s:hidden py-4 font-oswald text-lg s:text-2xl">
                  Order #{selectedOrder._id}
                </h2>
                <h2 className="s:hidden py-4 font-oswald text-lg s:text-2xl break-all line-clamp-1">
                  {selectedOrder._id}
                </h2>

                <p
                  onClick={handleBack}
                  className="text-[#007c42] text-sm underline cursor-pointer"
                >
                  Back to Orders
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-[#e3e3e3] border-b">
                <h3
                  onClick={() => setActiveTab("details")}
                  className={`px-5 py-3 cursor-pointer font-medium text-dark text-sm ${
                    activeTab === "details"
                      ? "border-filgreen border-b-[3px]"
                      : "border-transparent border-b-[3px]"
                  }`}
                >
                  Order Details
                </h3>
                <h3
                  onClick={() => setActiveTab("track")}
                  className={`px-4 py-3 cursor-pointer font-medium text-dark text-sm ${
                    activeTab === "track"
                      ? "border-filgreen border-b-[3px]"
                      : "border-transparent border-b-[3px]"
                  }`}
                >
                  Track Order
                </h3>
              </div>

              {activeTab === "details" && (
                <>
                  <div>
                    <div className="xs:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Order Date
                      </p>
                      <p className="sm:w-1/2 text-sm">
                        {" "}
                        {new Date(
                          selectedOrder.createdAt
                        ).toLocaleDateString()}{" "}
                      </p>
                    </div>
                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Delivery
                      </p>
                      <p className="sm:w-1/2 text-sm"> {formatAmount(0)} </p>
                    </div>
                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Discount
                      </p>
                      <p className="sm:w-1/2 text-sm"> {formatAmount(0)} </p>
                    </div>

                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">Total</p>
                      <p className="sm:w-1/2 text-sm">
                        {" "}
                        {formatAmount(selectedOrder.total)}{" "}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    {/* ORDER DETAILS HEADER */}
                    <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(150px,1fr)_40px_100px] nav:grid-cols-[30px_minmax(0,1fr)_70px_90px_130px] s:grid-cols-[minmax(150px,1fr)_40px_75px_100px] bg-[#f2f2f2] p-2 rounded-md">
                      <span className="max-s:hidden min-w-0 font-medium text-sm text-center">
                        #
                      </span>
                      <span className="min-w-0 font-medium text-sm">
                        PRODUCT
                      </span>
                      <span className="max-sm:hidden min-w-0 font-medium text-sm text-center">
                        QTY
                      </span>
                      <span className="min-w-0 font-medium text-sm text-center">
                        PRICE
                      </span>
                      <span className="min-w-0 font-medium text-sm"></span>
                    </div>

                    {/* ORDER DETAILS TABLE */}
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(150px,1fr)_40px_100px] nav:grid-cols-[30px_minmax(0,1fr)_70px_90px_130px] s:grid-cols-[minmax(150px,1fr)_40px_75px_100px] bg-[#fafafa] my-2 p-2 py-3 rounded-md text-sm sm:text-base"
                      >
                        <span className="max-nav:hidden min-w-0 text-sm text-center">
                          {index + 1}
                        </span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] xxs:w-[72px] h-[50px] xxs:h-[72px]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-[40px] xxs:w-[56px] h-[40px] xxs:h-[56px] object-contain"
                            />
                          </div>
                          <div>
                            <p className="my-1 min-w-0 font-oswald text-sm line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[#767676] text-xs">Wearables</p>
                            <p className="inline-block bg-[#dcf3de] px-2 py-1 rounded-md text-[#007c42] text-[10px]">
                              {selectedOrder.status}
                            </p>
                          </div>
                        </div>

                        <div className="text-dark text-sm text-center">
                          {item.quantity}
                        </div>
                        <div className="max-s:hidden text-dark text-sm text-center">
                          {formatAmount(item.price)}
                        </div>

                        <div className="">
                          <AddToCartButton
                            className="bg-filgreen px-2 nav:px-6 py-2 rounded-md w-full font-medium text-dark text-sm cursor-pointer"
                            product={item}
                          />

                          <button
                            onClick={() => setReturningProduct(item)}
                            className="mt-2 px-1 nav:px-4 py-2 border border-[#d9d9d9] rounded-md w-full font-medium text-filgreen text-xs nav:text-sm whitespace-nowrap cursor-pointer"
                          >
                            Return Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-[10px] bg-[#ddebfe] px-3 py-[14px] border border-[#331698] rounded-md w-full text-xs text">
                    {" "}
                    <span className="text-[#331689] text-2xl rotate-180">
                      {" "}
                      <AiOutlineExclamation />
                    </span>{" "}
                    Returns are accepted within 7 days of purchase. For this
                    order, the return window closes on{" "}
                    {getEstimatedDate(selectedOrder?.statusHistory)}
                  </div>

                  <div className="xs:flex gap-4 mt-6 w-full">
                    <div className="xs:w-1/2">
                      <h2 className="mb-4 font-oswald font-medium">
                        Delivery Information
                      </h2>

                      <h3 className="font-medium text-sm">
                        {" "}
                        {selectedOrder.firstName}{" "}
                      </h3>

                      <h3 className="mb-3 font-medium text-sm">
                        {" "}
                        {selectedOrder.email}{" "}
                      </h3>

                      <p className="my-3 text-[#575757] text-sm">
                        {" "}
                        {selectedOrder.address}
                      </p>

                      <p className="mb-3 text-sm">
                        {selectedOrder.city}, {selectedOrder.region}
                      </p>

                      <p className="mb-4 text-sm">{selectedOrder.phone}</p>

                      <div className="flex items-center gap-2">
                        <div className="w-[20px] h-[20px]">
                          <img
                            src="/delivery.png"
                            alt="Delivery"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="text-sm capitalize">
                          {selectedOrder.deliveryType}
                        </p>
                      </div>
                    </div>

                    <div className="max-xs:hidden w-1/2">
                      <h2 className="mb-4 font-oswald font-medium">
                        Payment Method
                      </h2>
                      <p className="text-sm">
                        {" "}
                        Pay with Cards, Bank Transfer or USSD{" "}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "track" && (
                <>
                  <div>
                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Order Date
                      </p>
                      <p className="sm:w-1/2 text-sm">
                        {" "}
                        {new Date(
                          selectedOrder.createdAt
                        ).toLocaleDateString()}{" "}
                      </p>
                    </div>
                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Delivery
                      </p>
                      <p className="sm:w-1/2 text-sm"> {formatAmount(0)} </p>
                    </div>
                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">
                        Discount
                      </p>
                      <p className="sm:w-1/2 text-sm"> {formatAmount(0)} </p>
                    </div>

                    <div className="sm:flex mb-3 w-full">
                      <p className="sm:w-1/2 text-[#767676] text-sm">Total</p>
                      <p className="sm:w-1/2 text-sm">
                        {" "}
                        {formatAmount(selectedOrder.total)}{" "}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-1 pt-8 border-[#e5e5e5] border-t text-[#3e3e3e] uppercase">
                    {" "}
                    your order #{selectedOrder._id} has been
                    <span className="font-medium">
                      {selectedOrder.status}{" "}
                    </span>{" "}
                  </div>

                  <OrderProgressBar
                    currentStatus={selectedOrder?.status || "Confirmed"}
                    statusHistory={selectedOrder?.statusHistory || []}
                  />

                  <div className="flex justify-center">
                    <Link
                      href="/contact"
                      className="mt-10 px-6 py-3 border border-[#d9d9d9] rounded-md w-fit font-medium text-filgreen text-sm text-center whitespace-nowrap cursor-pointer"
                    >
                      Need help?
                    </Link>
                  </div>
                </>
              )}
            </>
          )}

          {/* RETURN FORM VIEW */}
          {!loading && selectedOrder && returningProduct && (
            <>
              <div className="flex justify-between items-center border-[#e3e3e3] border-b">
                <h2 className="py-4 border-[#e3e3e3] font-oswald text-2xl">
                  Return Product
                </h2>

                <p
                  onClick={() => setReturningProduct(null)}
                  className="text-[#007c42] text-sm underline cursor-pointer"
                >
                  Back to Order Detail
                </p>
              </div>

              <div className="mt-4 rounded">
                <div className="flex justify-between items-center gap-4 bg-[#fafafa] mb-4 px-3 py-4 rounded-md">
                  <div className="flex justify-center items-center gap-2 rounded-md">
                    <img
                      src={returningProduct.image}
                      alt={returningProduct.name}
                      className="bg-[#f6f6f6] p-1 rounded-md w-[65px] h-[65px] object-contain"
                    />
                    <div>
                      <p className="font-oswald text-sm line-clamp-1">
                        {returningProduct.name}
                      </p>
                      <p className="text-[#767676] text-xs">Lifestyle</p>
                    </div>
                  </div>

                  <p className="text-dark text-sm">
                    Qty: {returningProduct.quantity}
                  </p>
                  <p className="text-dark text-sm">
                    Price: {formatAmount(returningProduct.price)}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className=""
                >
                  <div className="md:flex gap-4 md:mb-4 w-full">
                    {/* Product Condition */}
                    <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                      <label
                        className="text-sm"
                        htmlFor="productCondition"
                      >
                        <span className="text-red-600">*</span> Product
                        Condition
                      </label>
                      <input
                        type="text"
                        id="productCondition"
                        name="productCondition"
                        placeholder="Product Condition"
                        value={formData.productCondition}
                        onChange={handleChange}
                        className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        required
                      />
                    </div>

                    {/* Return Quantity */}
                    <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                      <label
                        className="text-sm"
                        htmlFor="returnQuantity"
                      >
                        <span className="text-red-600">*</span> Return Quantity
                      </label>
                      <input
                        type="number"
                        id="returnQuantity"
                        name="returnQuantity"
                        placeholder="Return Quantity"
                        value={formData.returnQuantity}
                        onChange={handleChange}
                        className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Reason for Return */}
                  <div className="mb-4 w-full">
                    <label
                      className="text-sm"
                      htmlFor="reasonForReturn"
                    >
                      <span className="text-red-600">*</span> Reason for Return
                    </label>
                    <textarea
                      name="reasonForReturn"
                      id="reasonForReturn"
                      placeholder="Reason for Return"
                      value={formData.reasonForReturn}
                      onChange={handleChange}
                      className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                      required
                    />
                  </div>

                  <div className="my-4">
                    <h3 className="font-oswald text-xl">Refund Details</h3>
                    <p className="text-[#3e3e3e] text-sm">
                      Provide us with the account details for processing the
                      refund.
                    </p>
                  </div>

                  <div className="md:flex gap-4 md:mb-4 w-full">
                    {/* Bank Name */}
                    <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                      <label
                        className="text-sm"
                        htmlFor="bankName"
                      >
                        <span className="text-red-600">*</span> Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        id="bankName"
                        placeholder="Bank Name"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        required
                      />
                    </div>

                    {/* Account Number */}
                    <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                      <label
                        className="text-sm"
                        htmlFor="accountNumber"
                      >
                        <span className="text-red-600">*</span> Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        id="accountNumber"
                        placeholder="Account Number"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <label
                      className="text-sm"
                      htmlFor="accountName"
                    >
                      <span className="text-red-600">*</span> Account Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      id="accountName"
                      placeholder="Account Name"
                      value={formData.accountName}
                      onChange={handleChange}
                      className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-1/2 text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end items-center gap-2 xxs:gap-4 mt-[38px] py-[18px] border-[#d9d9d9] border-t">
                    <button
                      onClick={() => setReturningProduct(null)}
                      className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
                    >
                      Submit
                    </button>
                  </div>

                  {message && (
                    <p className="text-green-600 text-sm">{message}</p>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
