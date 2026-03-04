"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineExclamation } from "react-icons/ai";
import { formatAmount } from "lib/utils";
import AddToCartButton from "./AddToCart";
import OrderProgressBar from "@/components/OrderTracking";
import { MdNavigateNext, MdKeyboardDoubleArrowRight } from "react-icons/md";
import Link from "next/link";

export default function OrderSheet() {
  const [items, setItems]               = useState([]);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab]       = useState("details");
  const [returningProduct, setReturningProduct] = useState(null);
  const [showContactForm, setShowContactForm]   = useState(false); // ✅ new

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

  function getEstimatedDate(statusHistory, status = "Delivered") {
    if (!Array.isArray(statusHistory)) return null;
    const entry =
      statusHistory.find((h) => h.status === status) ||
      statusHistory[statusHistory.length - 1];
    if (!entry?.date) return null;
    const d = new Date(entry.date);
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString();
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
    setShowContactForm(false);
    setActiveTab("details");
  };

  // ── Return form state ─────────────────────────────────────────────────────
  const [returnForm, setReturnForm] = useState({
    productCondition: "",
    returnQuantity: "",
    reasonForReturn: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [returnMessage, setReturnMessage] = useState("");

  const handleReturnChange = (e) => {
    setReturnForm({ ...returnForm, [e.target.name]: e.target.value });
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReturnMessage("");
    try {
      const payload = {
        ...returnForm,
        amount:       selectedOrder.total,
        address:      selectedOrder.address,
        region:       selectedOrder.region?.name || selectedOrder.region,
        city:         selectedOrder.city,
        phone:        selectedOrder.phone,
        orderId:      selectedOrder._id,
        productName:  returningProduct.name,
        productPrice: returningProduct.price,
      };
      const res = await axios.post("/api/returns", payload);
      setReturnMessage(res.data.message);
      setTimeout(() => setReturnMessage(""), 5000);
      setReturnForm({
  productCondition: "",
  returnQuantity:   "",
  reasonForReturn:  "",
  bankName:         "",
  accountNumber:    "",
  accountName:      "",
});
    } catch (err) {
      setReturnMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Contact/support form state ────────────────────────────────────────────
  const [contactForm, setContactForm] = useState({
    inquiryType: "general",   // "general" | "redress" | "suggestion"
    name:        "",
    email:       "",
    question:    "",
    reason:      "",
    productName: "",
  });
  const [contactFiles, setContactFiles]   = useState([]);
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactChange = (e) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage("");

    const payload = new FormData();
    Object.entries(contactForm).forEach(([k, v]) => payload.append(k, v));
    // attach order context if coming from order detail
    if (selectedOrder) payload.append("orderId", selectedOrder._id);
    contactFiles.forEach((f) => payload.append("files", f));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: payload });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContactMessage(data.message || "Message sent successfully!");
      setTimeout(() => setContactMessage(""), 5000);
      
      setContactForm({ inquiryType: "general", name: "", email: "", question: "", reason: "", productName: "" });
      setContactFiles([]);
    } catch {
      setContactMessage("Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const statusStyles = {
    Pending:    "bg-[#fff4cc] text-[#b38600]",
    Processing: "bg-[#ddeeff] text-[#0055cc]",
    Confirmed:  "bg-[#dcf3de] text-[#007c42]",
    Shipped:    "bg-[#e8e0ff] text-[#5500cc]",
    Delivered:  "bg-[#dcf3de] text-[#004d2b]",
    Cancelled:  "bg-[#ffe0e0] text-[#cc0000]",
  };

  const INQUIRY_TYPES = [
    { value: "general",    label: "💬 General Question" },
    { value: "redress",    label: "⚠️ Complaint / Redress" },
    { value: "suggestion", label: "💡 Suggestion / Recommendation" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="justify-center gap-4">
        <div className="order-1 mb-10 px-2 lg:px-6 pb-4 sm:pb-10 border border-[#e3e3e3] rounded-md w-full max-w-[851px]">

          {/* ── ORDER LIST ─────────────────────────────────────────────────── */}
          {!loading && !selectedOrder && (
            <>
              <div className="flex justify-between items-center mb-8 py-4 border-[#e3e3e3] border-b">
                <h2 className="font-oswald text-2xl">Orders</h2>
                <p className="text-[#767676] text-xs">{total} results</p>
              </div>

              <div>
                <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(0px,1fr)_90px] lg:grid-cols-[30px_minmax(120px,1fr)_100px_40px_60px_120px] nav:grid-cols-[30px_minmax(120px,1fr)_80px_40px_60px_100px] s:grid-cols-[20px_minmax(50px,1fr)_30px_60px_90px] bg-[#f2f2f2] max-s:px-2 py-2 border-[#e5e5e5] rounded-md">
                  <span className="max-s:hidden font-medium text-sm text-center">#</span>
                  <span className="font-medium text-sm">PRODUCT</span>
                  <span className="max-nav:hidden font-medium text-sm text-center whitespace-nowrap">ORDERED ON</span>
                  <span className="max-s:hidden font-medium text-sm text-center">QTY</span>
                  <span className="max-s:hidden font-medium text-sm text-center">PRICE</span>
                  <span className="font-medium text-sm"></span>
                </div>

                <div className="overflow-hidden">
                  {items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(0px,1fr)_90px] lg:grid-cols-[30px_minmax(120px,1fr)_100px_40px_60px_120px] nav:grid-cols-[30px_minmax(120px,1fr)_80px_40px_60px_100px] s:grid-cols-[20px_minmax(50px,1fr)_30px_60px_90px] bg-[#fafafa] my-2 p-2 rounded-md text-sm">
                      <span className="max-s:hidden text-sm text-center">{(page - 1) * limit + index + 1}</span>
                      <div className="flex items-center gap-1 nav:gap-3">
                        <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] tab:w-[72px] h-[50px] tab:h-[72px]">
                          <img src={item.image} alt={item.name} className="w-[40px] tab:w-[56px] h-[40px] tab:h-[56px] object-contain" />
                        </div>
                        <div>
                          <p className="min-w-0 text-xs break-all line-clamp-1">{item.orderId}</p>
                          <p className="my-1 font-oswald text-sm line-clamp-1">{item.name}</p>
                          <p className={`inline-block px-2 py-1 rounded-md text-[10px] ${statusStyles[item.status] || "bg-gray-100 text-gray-600"}`}>
                            {item.status}
                          </p>
                        </div>
                      </div>
                      <div className="max-nav:hidden text-dark text-sm text-center">{new Date(item.orderDate).toLocaleDateString()}</div>
                      <div className="max-s:hidden text-dark text-sm text-center">{item.quantity}</div>
                      <div className="max-s:hidden text-dark text-sm">{formatAmount(item.price)}</div>
                      <div className="w-full overflow-hidden">
                      <AddToCartButton
  className="bg-filgreen px-2 nav:px-6 py-2 rounded-md w-full font-medium text-dark text-sm cursor-pointer"
  product={{ ...item, availability: item.availability ?? true }} // 👈
/>
                        <button onClick={() => handleViewOrder(item.orderId)} className="mt-2 px-2 lg:px-4 py-2 border border-[#d9d9d9] rounded-md w-full font-medium text-filgreen text-xs s:text-sm whitespace-nowrap cursor-pointer">
                          View Details
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center">No orders found.</div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex flex-nowrap justify-center items-center gap-1 xs:gap-3 mx-auto mt-4 w-full max-w-[400px]">
                <button disabled={page <= 2} onClick={() => setPage((p) => Math.max(1, p - 2))} className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded-md rotate-180 cursor-pointer disabled:cursor-default shrink-0"><MdKeyboardDoubleArrowRight /></button>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded rotate-180 cursor-pointer disabled:cursor-default shrink-0"><MdNavigateNext /></button>
                <div className="flex flex-nowrap items-center gap-2 shrink">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || n === page || n === page - 1 || n === page + 1)
                    .reduce((acc, n, idx, arr) => { if (idx > 0 && n - arr[idx - 1] > 1) acc.push("ellipsis"); acc.push(n); return acc; }, [])
                    .map((item, i) => item === "ellipsis"
                      ? <span key={`e-${i}`} className="px-2">...</span>
                      : <button key={item} onClick={() => setPage(item)} className={`px-[6px] s:px-[14px] py-2 text-xs rounded-md shrink-0 ${page === item ? "bg-black text-white" : "hover:bg-[#e7e7e7] cursor-pointer"}`}>{item}</button>
                    )}
                </div>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="max-xs:hidden enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0"><MdNavigateNext /></button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages, p + 2))} className="enabled:hover:bg-[#e7e7e7] disabled:opacity-50 px-[6px] s:px-[14px] py-2 rounded cursor-pointer disabled:cursor-default shrink-0"><MdKeyboardDoubleArrowRight /></button>
              </div>
            </>
          )}

          {/* ── ORDER DETAILS ───────────────────────────────────────────────── */}
          {!loading && selectedOrder && !returningProduct && !showContactForm && (
            <>
              <div className="flex justify-between items-center border-[#e3e3e3] border-b">
                <h2 className="max-s:hidden py-4 font-oswald text-lg s:text-2xl">Order #{selectedOrder._id}</h2>
                <h2 className="s:hidden py-4 font-oswald text-lg break-all line-clamp-1">{selectedOrder._id}</h2>
                <p onClick={handleBack} className="text-[#007c42] text-sm underline cursor-pointer">Back to Orders</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-[#e3e3e3] border-b">
                {["details", "track"].map((tab) => (
                  <h3 key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 cursor-pointer font-medium text-dark text-sm capitalize ${activeTab === tab ? "border-filgreen border-b-[3px]" : "border-transparent border-b-[3px]"}`}>
                    {tab === "details" ? "Order Details" : "Track Order"}
                  </h3>
                ))}
              </div>

              {activeTab === "details" && (
                <>
                  <div>
                    {[
                      { label: "Order Date", value: new Date(selectedOrder.createdAt).toLocaleDateString() },
                      { label: "Delivery",   value: formatAmount(selectedOrder.deliveryFee ?? 0) },
                      { label: "Discount",   value: formatAmount(selectedOrder.discount ?? 0) },
                      { label: "Total",      value: formatAmount(selectedOrder.total) },
                    ].map(({ label, value }) => (
                      <div key={label} className="xs:flex mb-3 w-full">
                        <p className="sm:w-1/2 text-[#767676] text-sm">{label}</p>
                        <p className="sm:w-1/2 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(150px,1fr)_40px_100px] nav:grid-cols-[30px_minmax(0,1fr)_70px_90px_130px] s:grid-cols-[minmax(150px,1fr)_40px_75px_100px] bg-[#f2f2f2] p-2 rounded-md">
                      <span className="max-s:hidden min-w-0 font-medium text-sm text-center">#</span>
                      <span className="min-w-0 font-medium text-sm">PRODUCT</span>
                      <span className="max-sm:hidden min-w-0 font-medium text-sm text-center">QTY</span>
                      <span className="min-w-0 font-medium text-sm text-center">PRICE</span>
                      <span className="min-w-0 font-medium text-sm"></span>
                    </div>

                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(150px,1fr)_40px_100px] nav:grid-cols-[30px_minmax(0,1fr)_70px_90px_130px] s:grid-cols-[minmax(150px,1fr)_40px_75px_100px] bg-[#fafafa] my-2 p-2 py-3 rounded-md text-sm">
                        <span className="max-nav:hidden min-w-0 text-sm text-center">{index + 1}</span>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] xxs:w-[72px] h-[50px] xxs:h-[72px]">
                            <img src={item.image} alt={item.name} className="w-[40px] xxs:w-[56px] h-[40px] xxs:h-[56px] object-contain" />
                          </div>
                          <div>
                            <p className="my-1 min-w-0 font-oswald text-sm line-clamp-1">{item.name}</p>
                            <p className={`inline-block px-2 py-1 rounded-md text-[10px] ${statusStyles[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>
                              {selectedOrder.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-dark text-sm text-center">{item.quantity}</div>
                        <div className="max-s:hidden text-dark text-sm text-center">{formatAmount(item.price)}</div>
                        <div>
                         <AddToCartButton
  className="bg-filgreen px-2 nav:px-6 py-2 rounded-md w-full font-medium text-dark text-sm cursor-pointer"
  product={{ ...item, availability: item.availability ?? true }} // 👈
/>
                          <button onClick={() => setReturningProduct(item)} className="mt-2 px-1 nav:px-4 py-2 border border-[#d9d9d9] rounded-md w-full font-medium text-filgreen text-xs nav:text-sm whitespace-nowrap cursor-pointer">
                            Return Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-[10px] bg-[#ddebfe] px-3 py-[14px] border border-[#331698] rounded-md w-full text-xs mt-4">
                    <span className="text-[#331689] text-2xl rotate-180"><AiOutlineExclamation /></span>
                    Returns are accepted within 7 days of purchase. For this order, the return window closes on {getEstimatedDate(selectedOrder?.statusHistory)}
                  </div>

                  <div className="xs:flex gap-4 mt-6 w-full">
                    <div className="xs:w-1/2">
                      <h2 className="mb-4 font-oswald font-medium">Delivery Information</h2>
                      <h3 className="font-medium text-sm">{selectedOrder.firstName}</h3>
                      <h3 className="mb-3 font-medium text-sm">{selectedOrder.email}</h3>
                      <p className="my-3 text-[#575757] text-sm">{selectedOrder.address}</p>
                      {/* ✅ FIX: region is an object — extract .name */}
                      <p className="mb-3 text-sm">
                        {selectedOrder.city}, {selectedOrder.region?.name || selectedOrder.region || "—"}
                      </p>
                      <p className="mb-4 text-sm">{selectedOrder.phone}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-[20px] h-[20px]">
                          <img src="/delivery.png" alt="Delivery" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm capitalize">{selectedOrder.deliveryType}</p>
                      </div>
                    </div>
                    {/* <div className="max-xs:hidden w-1/2">
                      <h2 className="mb-4 font-oswald font-medium">Payment Method</h2>
                      <p className="text-sm">Pay with Cards, Bank Transfer or USSD</p>
                    </div> */}
                  </div>

                  {/* ✅ Contact / Support button */}
                  <div className="mt-8 pt-6 border-t border-[#e3e3e3]">
                    <p className="mb-3 text-sm text-[#767676]">Have an issue with this order?</p>
                    <button
                      onClick={() => {
                        setShowContactForm(true);
                        setContactForm((prev) => ({
                          ...prev,
                          productName: selectedOrder.items?.[0]?.name || "",
                        }));
                      }}
                      className="px-5 py-2.5 border border-[#d9d9d9] rounded-md font-medium text-filgreen text-sm hover:bg-[#f6f6f6] transition-colors cursor-pointer"
                    >
                      Contact Support →
                    </button>
                  </div>
                </>
              )}

              {activeTab === "track" && (
                <>
                  <div>
                    {[
                      { label: "Order Date", value: new Date(selectedOrder.createdAt).toLocaleDateString() },
                      { label: "Delivery",   value: formatAmount(selectedOrder.deliveryFee ?? 0) },
                      { label: "Discount",   value: formatAmount(selectedOrder.discount ?? 0) },
                      { label: "Total",      value: formatAmount(selectedOrder.total) },
                    ].map(({ label, value }) => (
                      <div key={label} className="sm:flex mb-3 w-full">
                        <p className="sm:w-1/2 text-[#767676] text-sm">{label}</p>
                        <p className="sm:w-1/2 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center items-center gap-1 pt-8 border-[#e5e5e5] border-t text-[#3e3e3e] uppercase text-sm">
                    your order #{selectedOrder._id} has been
                    <span className="font-medium ml-1">{selectedOrder.status}</span>
                  </div>

                  <OrderProgressBar
                    currentStatus={selectedOrder?.status || "Confirmed"}
                    statusHistory={selectedOrder?.statusHistory || []}
                  />

                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="px-6 py-3 border border-[#d9d9d9] rounded-md w-fit font-medium text-filgreen text-sm text-center whitespace-nowrap cursor-pointer hover:bg-[#f6f6f6] transition-colors"
                    >
                      Need help?
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── CONTACT / SUPPORT FORM ──────────────────────────────────────── */}
          {!loading && selectedOrder && showContactForm && !returningProduct && (
            <>
              <div className="flex justify-between items-center border-[#e3e3e3] border-b">
                <h2 className="py-4 font-oswald text-2xl">Contact Support</h2>
                <p onClick={() => setShowContactForm(false)} className="text-[#007c42] text-sm underline cursor-pointer">
                  Back to Order
                </p>
              </div>

              {/* Order context pill */}
              <div className="flex items-center gap-2 bg-[#f6f6f6] mt-4 mb-6 px-4 py-3 rounded-md text-sm">
                <span className="text-[#767676]">Regarding order:</span>
                <span className="font-medium">#{selectedOrder._id}</span>
              </div>

              {/* Inquiry type selector */}
              <div className="mb-6">
                <p className="mb-3 font-medium text-sm">What can we help you with?</p>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setContactForm((prev) => ({ ...prev, inquiryType: type.value }))}
                      className={`px-4 py-3 rounded-md border-2 text-sm font-medium text-left transition-all cursor-pointer ${
                        contactForm.inquiryType === type.value
                          ? "border-filgreen bg-[#f0fdf6] text-[#007c42]"
                          : "border-[#e3e3e3] hover:border-[#c0c0c0] text-[#3e3e3e]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* Name & Email */}
                <div className="xxs:flex gap-4 w-full">
                  <div className="max-xxs:mb-3 w-full">
                    <label className="text-sm"><span className="text-red-600">*</span> Name</label>
                    <input name="name" value={contactForm.name} onChange={handleContactChange} required
                      className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" placeholder="Your name" />
                  </div>
                  <div className="w-full">
                    <label className="text-sm"><span className="text-red-600">*</span> Email</label>
                    <input name="email" type="email" value={contactForm.email} onChange={handleContactChange} required
                      className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" placeholder="Your email" />
                  </div>
                </div>

                {/* Product Name (pre-filled) */}
                <div>
                  <label className="text-sm">Product Name</label>
                  <input name="productName" value={contactForm.productName} onChange={handleContactChange}
                    className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" placeholder="Product name (if applicable)" />
                </div>

                {/* Question / Message */}
                <div>
                  <label className="text-sm"><span className="text-red-600">*</span>
                    {contactForm.inquiryType === "general"    && " Your Question"}
                    {contactForm.inquiryType === "redress"    && " Describe the Issue"}
                    {contactForm.inquiryType === "suggestion" && " Your Suggestion"}
                  </label>
                  <textarea name="question" value={contactForm.question} onChange={handleContactChange} required rows={4}
                    className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm resize-none"
                    placeholder={
                      contactForm.inquiryType === "redress"
                        ? "Please describe what went wrong and what outcome you'd like..."
                        : contactForm.inquiryType === "suggestion"
                        ? "We'd love to hear your thoughts..."
                        : "How can we help you?"
                    }
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="text-sm">Attachments (optional)</label>
                  <label
                    onDrop={(e) => { e.preventDefault(); setContactFiles(Array.from(e.dataTransfer.files)); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col justify-center items-center bg-[#f6f6f6] border border-dashed border-[#b7b7b7] rounded-md mt-2 py-6 text-center cursor-pointer hover:bg-[#efefef] transition-colors"
                  >
                    {contactFiles.length === 0 ? (
                      <>
                        <p className="text-xs font-medium text-[#767676]">.PDF, .JPG, .JPEG, .PNG</p>
                        <p className="mt-1 text-xs text-[#929292]">Drag & drop or <span className="text-[#034da2] underline">click to upload</span></p>
                        <p className="mt-1 text-xs text-[#929292]">Max 5MB</p>
                      </>
                    ) : (
                      <div className="px-4 w-full">
                        {contactFiles.map((f, i) => <p key={i} className="text-xs text-gray-700 truncate">{f.name}</p>)}
                        <p className="mt-1 text-xs text-[#929292]">Click to change</p>
                      </div>
                    )}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => setContactFiles(Array.from(e.target.files))} className="hidden" />
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e3e3e3]">
                  <button type="button" onClick={() => setShowContactForm(false)}
                    className="px-6 py-3 border border-[#d9d9d9] rounded-md font-medium text-dark text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={contactLoading}
                    className="bg-filgreen px-6 py-3 rounded-md font-medium text-dark text-sm disabled:opacity-60 cursor-pointer">
                    {contactLoading ? "Sending..." : "Send Message"}
                  </button>
                </div>

                {contactMessage && (
                  <p className={`text-sm mt-2 ${contactMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                    {contactMessage}
                  </p>
                )}
              </form>
            </>
          )}

          {/* ── RETURN FORM ─────────────────────────────────────────────────── */}
          {!loading && selectedOrder && returningProduct && (
            <>
              <div className="flex justify-between items-center border-[#e3e3e3] border-b">
                <h2 className="py-4 font-oswald text-2xl">Return Product</h2>
                <p onClick={() => setReturningProduct(null)} className="text-[#007c42] text-sm underline cursor-pointer">
                  Back to Order Detail
                </p>
              </div>

              <div className="mt-4 rounded">
                <div className="flex justify-between items-center gap-4 bg-[#fafafa] mb-4 px-3 py-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <img src={returningProduct.image} alt={returningProduct.name} className="bg-[#f6f6f6] p-1 rounded-md w-[65px] h-[65px] object-contain" />
                    <div>
                      <p className="font-oswald text-sm line-clamp-1">{returningProduct.name}</p>
                    </div>
                  </div>
                  <p className="text-dark text-sm">Qty: {returningProduct.quantity}</p>
                  <p className="text-dark text-sm">Price: {formatAmount(returningProduct.price)}</p>
                </div>

                <form onSubmit={handleReturnSubmit}>
                  <div className="md:flex gap-4 md:mb-4 w-full">
                    <div className="max-md:mb-3 w-full">
                      <label className="text-sm"><span className="text-red-600">*</span> Product Condition</label>
                      <input type="text" name="productCondition" value={returnForm.productCondition} onChange={handleReturnChange} required
                        placeholder="Product Condition" className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" />
                    </div>
                    <div className="max-md:mb-3 w-full">
                     <label className="text-sm">
  <span className="text-red-600">*</span> Return Quantity
  <span className="text-[#929292] ml-1">(max: {returningProduct?.quantity})</span>
</label>
                     <input
  type="number"
  name="returnQuantity"
  value={returnForm.returnQuantity}
  onChange={(e) => {
    const max = returningProduct?.quantity || 1;
    const val = Math.min(Number(e.target.value), max);
    setReturnForm({ ...returnForm, returnQuantity: val });
  }}
  required
  min={1}
  max={returningProduct?.quantity || 1}
  placeholder="Return Quantity"
  className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
/>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm"><span className="text-red-600">*</span> Reason for Return</label>
                    <textarea name="reasonForReturn" value={returnForm.reasonForReturn} onChange={handleReturnChange} required
                      placeholder="Reason for Return" className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" />
                  </div>

                  <div className="my-4">
                    <h3 className="font-oswald text-xl">Refund Details</h3>
                    <p className="text-[#3e3e3e] text-sm">Provide the account details for processing your refund.</p>
                  </div>

                  <div className="md:flex gap-4 md:mb-4 w-full">
                    <div className="max-md:mb-3 w-full">
                      <label className="text-sm"><span className="text-red-600">*</span> Bank Name</label>
                      <input type="text" name="bankName" value={returnForm.bankName} onChange={handleReturnChange} required
                        placeholder="Bank Name" className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" />
                    </div>
                    <div className="max-md:mb-3 w-full">
                      <label className="text-sm"><span className="text-red-600">*</span> Account Number</label>
                      <input type="text" name="accountNumber" value={returnForm.accountNumber} onChange={handleReturnChange} required
                        placeholder="Account Number" className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm"><span className="text-red-600">*</span> Account Name</label>
                    <input type="text" name="accountName" value={returnForm.accountName} onChange={handleReturnChange} required
                      placeholder="Account Name" className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-1/2 text-sm" />
                  </div>

                  <div className="flex justify-end items-center gap-3 mt-10 py-4 border-t border-[#d9d9d9]">
                    <button type="button" onClick={() => setReturningProduct(null)}
                      className="px-6 py-3 border border-[#d9d9d9] rounded-md font-medium text-dark text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="bg-filgreen px-6 py-3 rounded-md font-medium text-dark text-sm disabled:opacity-60">
                      Submit Return
                    </button>
                  </div>

                  {returnMessage && <p className="text-green-600 text-sm mt-2">{returnMessage}</p>}
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}