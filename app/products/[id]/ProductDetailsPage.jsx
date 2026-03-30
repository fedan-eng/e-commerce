"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useGAEvent } from "@/hooks/useGAEvent";
import { addRecentlyViewed } from "@/store/features/recentlyViewedSlice";
import { getProduct } from "@/store/features/productSlice";
import AddToCartButton from "@/components/AddToCart";
import WishlistButton from "@/components/WishlistButton";
import Loading from "@/components/Loading";
import Rating from "@/components/Rating";
import { formatAmount } from "@/lib/utils";
import Image from "next/image";
import { AiOutlineExclamation } from "react-icons/ai";
import ProductTabs from "@/components/ProductTabs";
import axios from "axios";
import Accordion from "@/components/Accordion";
import { CheckCircle } from 'lucide-react';
import {
  GoChevronDown,
  GoChevronUp,
  GoChevronLeft,
  GoChevronRight,
} from "react-icons/go"; 
import { formatDistanceToNow } from "date-fns";
import BuyNow from "@/components/BuyNow";


async function fetchProduct(id) {
  const res = await fetch(`https://www.filstore.com.ng/api/products/${id}`, {
    cache: 'no-store'
  });
  const data = await res.json();
  return data.product || data;
}

export async function generateMetadata({ params }) {
  const { id } = params;

  let product = null;
  try {
    const res = await fetch(`https://www.filstore.com.ng/api/products/${id}`, {
      cache: "no-store",
    });
    const json = await res.json();
    product = json.product || json;
  } catch (e) {
    console.error("Failed to load product metadata", e);
  }

  const title = product ? `${product.name} | FIL Store` : "Product | FIL Store";
  const description = product?.description || "Quality tech products available at FIL Store Nigeria.";
  const url = `https://www.filstore.com.ng/products/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: product?.image ? [{ url: product.image }] : [],
    },
  };
}




export default function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    single: product,
    loading,
    error,
  } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { trackEvent } = useGAEvent();

  useEffect(() => {
    if (!product?._id) return;
    trackEvent("view_item", {
      item_id: product._id,
      item_name: product.name,
      currency: "NGN",
      value: product.price,
      items: [{ item_id: product._id, item_name: product.name, price: product.price }],
    });
  }, [product?._id, product?.name, product?.price, trackEvent]);

  const points = [
    { img: "/express.png", text: "Fast And Reliable Delivery" },
    { img: "/calender.png", text: "7 Days Return" },
    { img: "/support.png", text: "24/7 Support" },
    {
      img: "/certified.png",
      text: "Best Quality from many years in the market",
    },
  ];

  const deliveryOptions = [
    { img: "/regular-bus.png", text: "Regular Delivery (1-3 Working Days)" },
    {
      img: "/express-bus.png",
      text: "Express Delivery (Within 24 hours, for orders placed before 10am)",
    },
    { img: "/free-bus.png", text: "Free Delivery on Thursdays" },
  ];

  const formatContent = (description) => {
    if (!description) return null;

    const Content = () => {
      const [expanded, setExpanded] = useState(false);

      const words = description.split(/\s+/);
      const truncatedDescription = words.slice(0, 29).join(" ");

      return (
        <span className="mb-2 text-gray-700">
          {expanded ? description : truncatedDescription}
          {words.length > 29 && (
            <>
              {!expanded && "... "}
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 font-medium text-filgreen text-xs hover:underline"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            </>
          )}
        </span>
      );
    };
    return <Content />;
  };

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [showShareModal, setShowShareModal] = useState(false);
const [linkCopied, setLinkCopied] = useState(false);
  const limit = 5;

  const totalPages = Math.ceil(comments.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const currentComments = comments.slice(startIndex, endIndex);

  const paginatedComments = useMemo(() => {
    const sorted = [...comments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const start = (page - 1) * limit;
    const end = start + limit;
    return sorted.slice(start, end);
  }, [comments, page, limit]);

  const accordionItems = useMemo(
    () => [
      {
        title: "Filter Rating",
        content: (
          <div className="">
            {[5, 4, 3, 2, 1].map((star) => (
              <label
                key={star}
                className="flex items-center gap-2 py-2 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="peer hidden"
                />
                <span className="flex justify-center items-center peer-checked:bg-black border border-black rounded w-4 h-4">
                  <svg
                    className="peer-checked:block w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {star} Star{star > 1 ? "s" : ""}
              </label>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/products/${id}/comments`);
        setComments(res.data.filter(c => !c.status || c.status === "approved"));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    if (id) fetchComments();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/products/${id}/comments`, { text: commentText });
      setCommentText("");
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to post comment. Please log in.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id && (!product || product._id !== id)) {
      dispatch(getProduct(id));
    }
  }, [dispatch, id, product]);

  useEffect(() => {
    if (product && product._id) {
      dispatch(addRecentlyViewed(product));
      setSelectedImage(product.image || "");
    }
  }, [product, dispatch]);

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setZoomOrigin({ x, y });
      setIsZoomed(true);
    }
  };

  const handleCopyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  setLinkCopied(true);
  setTimeout(() => setLinkCopied(false), 2000);
};

const shareUrl = typeof window !== "undefined" ? window.location.href : "";
const shareText = `Check out ${product?.name} on FIL Store!`;

  if (loading)
    return (
      <div className="h-screen">
        <Loading />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const currentImages = selectedColor
    ? [
        ...(selectedColor.images || []),
        ...(product.secondaryImages || []).filter(
          (img) => !selectedColor.images.includes(img)
        ),
      ]
    : [product.image, ...(product.secondaryImages || [])];

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setSelectedImage(color.images?.[0] || product.image);
    setIsZoomed(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      {/* Review submitted toast */}
      <div style={{
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, pointerEvents: "none",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: commentSubmitted ? 1 : 0,
        transform: commentSubmitted ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: "10px", padding: "14px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          minWidth: "300px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#6ae8a015", border: "1px solid #6ae8a033",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "14px",
          }}>✓</div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#e8e8e8" }}>
              Review submitted!
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6ae8a0" }}>
              Your review is pending approval and will appear shortly.
            </p>
          </div>
        </div>
      </div>

      <div className="md:flex gap-3 nav:gap-6">
        {/* Left side - Images */}
        <div className="flex flex-col items-center gap-4 md:gap-10 mt-3 md:mt-12 basis-[546px]">
          <div 
            className="w-[200px] nav:w-[381px] xxs:w-[300px] nav:h-[381px] overflow-hidden relative"
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 ease-out"
                style={{
                  transform: isZoomed ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`
                }}
                onClick={handleImageClick}
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          <div className="max-sm:pl-32 flex justify-center overflow-auto gap-2 pt-3 md:pt-6 border-[#dfdfdf] border-t w-full">
            {currentImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx}`}
                className={`xxs:w-[70px] w-[50px] h-[50px] xxs:h-[70px] object-contain border border-[#f5f5f5] rounded-md cursor-pointer p-2 ${
                  selectedImage === img ? "ring-2 ring-filgreen" : ""
                }`}
                onClick={() => {
                  setSelectedImage(img);
                  setIsZoomed(false);
                }}
              />
            ))}
          </div>

          <div className="self-start mt-[38px]">
            <h3 className="mx-2 font-oswald font-medium text-2xl">
              Product Live Cam
            </h3>

            <div className="flex gap-2 md:gap-4 mx-2 my-4">
              {product.videos?.map((video, index) => (
                <div
                  key={index}
                  className="relative w-full"
                >
                  {activeVideo === index ? (
                    <video
                      src={video}
                      controls
                      autoPlay
                      className="shadow rounded-md w-full"
                    />
                  ) : (
                    <div
                      onClick={() => setActiveVideo(index)}
                      className="group relative cursor-pointer"
                    >
                      <video
                        src={video}
                        className="opacity-70 group-hover:opacity-100 rounded-lg w-full"
                        muted
                      />
                      <div className="absolute">
                        <img
                          src="/play.svg"
                          alt="play"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right side - Details */}
        <div className="flex flex-col relative gap-4 bg-[#fafafa] px-2 nav:px-6 pt-8 basis-[546px]">
          {product.originalPrice && (<div className="bg-black px-3 py-1 rounded-2xl w-fit text-[10px] text-white">
            Save{" "}
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )}
            %
          </div>)}
          
          <button
    onClick={() => setShowShareModal(true)}
    className={`flex items-center ${product.originalPrice && 'md:absolute md:top-10 md:right-10' } max-[500px]:absolute max-[500px]:top-10 max-[500px]:right-10  w-fit ${product.originalPrice ? "" : "justify-end"}  gap-1.5 px-3 py-1.5 border border-[#e5e5e5] rounded-full text-xs text-[#3e3e3e] hover:bg-[#f5f5f5] transition-colors cursor-pointer`}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    Share
  </button>

          <div>
            <h3 className="mb-2 font-oswald font-medium text-2xl">
              {product.name}
            </h3>
            <div className="flex gap-0.5">
              <img
                src="/star.png"
                alt="Star"
              />
              <p className="text-[10px] text-black sm:text-xs">
                {product.averageRating.toFixed(1)}
              </p>
              <p className="text-[10px] text-black sm:text-xs">
                ({product.ratingsCount || 0})
              </p>
            </div>

            <p className="mt-5 text-[#3e3e3e] text-xs">
              {formatContent(product.description)}
            </p>

            {/* Color Options */}
            <div>
              {product.colors?.length > 0 && (<p className="mt-5 font-medium text-xs">Available Colors</p>)}

              {product.colors?.length > 0 && (
                <div className="flex items-center gap-2 mt-1 pb-4">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`w-8 h-8 rounded-md border-black border-1 ${
                        selectedColor === color
                          ? "border-3 border-filgreen"
                          : ""
                      }`}
                      style={{ backgroundColor: color.name.toLowerCase() }}
                      onClick={() => handleSelectColor(color)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* price */}
            <span className="flex gap-3 mt-6 mb-2">
              {product.originalPrice && (
                <p className="font-medium text-gray-400 text-2xl line-through">
                  {formatAmount(product.originalPrice)}
                </p>
              )}
              <p className="font-medium text-[#1c1b1f] text-2xl">
                {formatAmount(product.price)}
              </p>
            </span>

            {/* buttons */}
            <div className="flex max-xxs:flex-col gap-2 xxs:gap-4 mt-10 fl">
              <WishlistButton
                text
                className="max-xxs:order-2 px-6 max-xxs:px-3 py-3 max-xxs:py-2 border border-[#dfdfdf] rounded-md w-full font-medium text-[#007c42] hover:text-filgreen xs:text-sm whitespace-nowrap transition"
                product={product}
              />

              <AddToCartButton
                className={`max-xxs:order-1 ${product.availability ? "bg-filgreen text-white hover:bg-[#007c42]" : "bg-gray-300 text-gray-500 cursor-not-allowed"} px-6 max-xxs:px-3 py-3 max-xxs:py-2 rounded-md w-full font-medium text-sm whitespace-nowrap transition`}
                product={product}
                selectedColor={selectedColor}
              />
              {user && 
              <BuyNow className={`max-xxs:order-1 ${product.availability ? "bg-filgreen text-white hover:bg-[#007c42]" : "bg-gray-300 text-gray-500 cursor-not-allowed"} px-6 max-xxs:px-3 py-3 max-xxs:py-2 rounded-md w-full font-medium text-sm whitespace-nowrap transition`} product={product} />}
            </div>

            {/* Assurance Points */}
            <div className="mt-6">
              <h3 className="mb-4 font-oswald font-medium text-2xl">
                We Assure You
              </h3>

              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-[#e5e5e5] border-b"
                >
                  <img
                    src={point.img}
                    alt={point.text}
                    className="w-7 h-7 object-contain"
                  />
                  <p className="py-[18px] text-sm">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="max-nav:hidden mt-6 pb-4 border-[#e5e5e5] border-b">
              <p className="mb-4 font-oswald font-medium text-2xl capitalize">
                PAYMENT METHOD
              </p>
              <div className="flex items-center gap-6">
                <div className="w-[88px] h-[32px]">
                  <Image
                    width={88}
                    height={32}
                    src="/paystack.png"
                    alt="paystack"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="max-nav:hidden mt-6 rounded-md">
              <p className="mb-4 font-oswald font-medium text-2xl">
                Our Delivery Options
              </p>

              <div className="flex items-center gap-[10px] bg-[#ddebfe] mb-4 px-3 py-[14px] border border-[#331698] rounded-md w-full text-xs text">
                <span className="text-[#331689] text-2xl rotate-180">
                  <AiOutlineExclamation />
                </span>
                Please note that delivery within Lagos is 1 - 3 working days and
                outside Lagos and 5 - 7 working days.
              </div>

              {deliveryOptions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border-[#e5e5e5] border-b"
                >
                  <img
                    src={item.img}
                    alt={item.text}
                    className="w-7 h-7 object-contain"
                  />
                  <p className="py-[18px] text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductTabs
        description={product.description}
        features={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto p-6">
            {product.features?.length > 0 ? (
              product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 p-6 border bg-gray-500/10 border-[#d9d9d9] rounded-lg hover:shadow-md transition-shadow"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <p className="text-sm text-center text-gray-800">
                    {feat}
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No features available</p>
            )}
          </div>
        }
        boxContent={
          <div className="flex justify-center items-center gap-5 nav:gap-40 side:gap-10">
            <div className="flex justify-center items-center w-[200px] sm:w-[381px] h-[200px] sm:h-[381px] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="mb-6 font-oswald font-medium text-2xl">
                What's in the box?
              </p>
              {product.boxContent?.map((boxItem, idx) => (
                <p
                  className="pb-4 text-sm"
                  key={idx}
                >
                  {boxItem.quantity} x {boxItem.item}
                </p>
              ))}
            </div>
          </div>
        }
        reviews={
          <div className="">
            <div className="flex max-sm:flex-col gap-2 md:gap-6">
              <div className="bg-white p-4 rounded-md sm:basis-[253px]">
                <div className="text-[#3e3e3e] text-sm text-center">
                  <span className="font-oswald font-medium text-[40px] text-black">
                    {product.averageRating.toFixed(1)}
                  </span>
                  out of 5
                </div>
                <Rating
                  productId={product._id}
                  className="flex-justify-center my-2 text-base text-center"
                  readonly
                />
                <p className="pb-2 sm:pb-6 text-[#3e3e3e] text-sm text-center">
                  ({product.ratingsCount} Reviews)
                </p>

                <div className="max-sm:hidden border-[#dfdfdf] border-t">
                  <Accordion
                    items={accordionItems}
                    defaultOpenIndex={0}
                    headerClassName="text-xs pt-6 pb-4 font-medium"
                    contentClassName="text-sm"
                    icon={({ isOpen }) =>
                      isOpen ? <GoChevronUp /> : <GoChevronDown />
                    }
                    iconClassName="text-black text-lg font-bold"
                  />
                </div>
              </div>
              <div className="sm:basis-[816px]">
                {user ? (
                  <div>
                    <div className="flex justify-between items-center mb-4 py-5 border-[#dfdfdf] border-b w-full">
                      <div className="text-[#3e3e3e] text-xs">
                        {Math.min(endIndex, comments.length)} of{" "}
                        {comments.length} Results
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={page === 1}
                          className="flex justify-center items-center bg-black disabled:bg-white rounded-md w-8 h-8 text-xs"
                        >
                          <GoChevronLeft
                            size={14}
                            color={page === 1 ? "#b7b7b7" : "white"}
                          />
                        </button>
                        <button
                          onClick={() =>
                            setPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={page === totalPages || totalPages === 0}
                          className="flex justify-center items-center bg-black disabled:bg-white rounded-md w-8 h-8 text-xs"
                        >
                          <GoChevronRight
                            size={14}
                            color={
                              page === totalPages || totalPages === 0
                                ? "#b7b7b7"
                                : "white"
                            }
                          />
                        </button>
                      </div>
                    </div>
                    <p className="mb-2 font-medium text-sm">Add Review</p>

                    <form
                      onSubmit={handleSubmitComment}
                      className="sm:flex items-start gap-2"
                    >
                      <div className="bg-white mb-2 rounded-md w-full">
                        <textarea
                          value={commentText}
                          onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/);
                            if (words.length <= 100) {
                              setCommentText(e.target.value);
                            }
                          }}
                          rows={2}
                          placeholder="Write here..."
                          className="bg-white p-3 rounded-md outline-0 w-full text-xs"
                          required
                        />
                        <div className="mx-3 py-3 border-[#e5e5e5] border-t">
                          <p className="text-[#767676] text-xs">
                            {commentText.trim() === ""
                              ? 0
                              : commentText.trim().split(/\s+/).length}
                            /100 chars
                          </p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-black max-sm:mb-4 px-4 py-2 rounded-md font-medium text-white text-xs cursor-pointer"
                        disabled={submitting}
                      >
                        {submitting ? "Posting..." : "Post"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="my-4 text-gray-600 text-sm">
                    <a
                      href="/login"
                      className="text-filgreen underline"
                    >
                      Log in
                    </a>{" "}
                    or{" "}
                    <a
                      href="/register"
                      className="text-filgreen underline"
                    >
                      register
                    </a>{" "}
                    to post a comment.
                  </p>
                )}
                {paginatedComments.length === 0 ? (
                  <p className="text-gray-500">No comments yet.</p>
                ) : (
                  <div>
                    {paginatedComments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white mb-2 p-3 rounded-md"
                      >
                        <p className="pb-3 font-medium text-xs">
                          {comment.user && typeof comment.user === "object"
                            ? comment.user.firstName ||
                              comment.user.name ||
                              "User"
                            : "User"}
                        </p>
                        <p className="pb-3 text-[#3e3e3e] text-xs">
                          {comment.text}
                        </p>
                        <p className="pb-3 text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>

                        <div className="flex items-center gap-1">
                          <img
                            src="/verified.svg"
                            alt=""
                          />
                          <p className="text-[#1a7841] text-xs">
                            Verified Customer
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
      />
      {/* Share Modal */}
{showShareModal && (
  <div
    className="z-[9999] fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4"
    onClick={() => setShowShareModal(false)}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-oswald font-medium text-lg">Share Product</h3>
        <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-black text-xl cursor-pointer">✕</button>
      </div>

      {/* Product preview */}
      <div className="flex items-center gap-3 bg-[#f6f6f6] rounded-lg p-3 mb-5">
        <img src={product.image} alt={product.name} className="w-12 h-12 object-contain rounded-md bg-white" />
        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
      </div>

      {/* Share options */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#f0fdf6] transition-colors group"
        >
          <div className="flex justify-center items-center bg-[#25D366] rounded-full w-11 h-11">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <span className="text-[10px] text-[#3e3e3e]">WhatsApp</span>
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#f0f4ff] transition-colors"
        >
          <div className="flex justify-center items-center bg-black rounded-full w-11 h-11">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </div>
          <span className="text-[10px] text-[#3e3e3e]">Twitter</span>
        </a>

        {/* Instagram — no direct share API, opens Instagram */}
        <a
          href="https://www.instagram.com"
          target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#fdf0f6] transition-colors"
        >
          <div className="flex justify-center items-center rounded-full w-11 h-11" style={{background:"radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <span className="text-[10px] text-[#3e3e3e]">Instagram</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#f6f6f6] transition-colors cursor-pointer"
        >
          <div className={`flex justify-center items-center rounded-full w-11 h-11 transition-colors ${linkCopied ? "bg-filgreen" : "bg-[#e5e5e5]"}`}>
            {linkCopied
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3e3e3e" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            }
          </div>
          <span className="text-[10px] text-[#3e3e3e]">{linkCopied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}