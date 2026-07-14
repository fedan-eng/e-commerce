"use client";

import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "next/navigation";
import {useGAEvent} from "@/hooks/useGAEvent";
import {useMetaPixelEvent} from "@/hooks/useMetaPixelEvent";
import {useTikTokEvent} from "@/hooks/useTikTokEvent";
import {addRecentlyViewed} from "@/store/features/recentlyViewedSlice";
import {getProduct} from "@/store/features/productSlice";
import AddToCartButton from "@/components/AddToCart";
import WishlistButtonPD from "@/components/WishlistButtonPD";
import Loading from "@/components/Loading";
import {formatAmount} from "@/lib/utils";
import Accordion from "@/components/Accordion";
import axios from "axios";
import {
  CheckCircle,
  Share,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  CreditCard,
  Truck,
  Info,
  Star,
  Copy,
  Check,
  X,
  Zap,
  Shield,
  AlertTriangle,
  Usb,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BuyNow from "@/components/BuyNow";

// ─── Feature Icon Helper ───────────────────────────────────────────────────────
const getFeatureIcon = (feature) => {
  const f = feature.toLowerCase();
  if (f.includes("fast") && f.includes("charg"))
    return <Zap className="w-8 h-8" />;
  if (f.includes("protect") && f.includes("heat"))
    return <Shield className="w-8 h-8" />;
  if (f.includes("overload") && f.includes("protect"))
    return <AlertTriangle className="w-8 h-8" />;
  if (f.includes("type") && f.includes("c") && f.includes("port"))
    return <Usb className="w-8 h-8" />;
  if (f.includes("fast") && f.includes("delivery"))
    return <Truck className="w-8 h-8" />;
  if (f.includes("return")) return <AlertTriangle className="w-8 h-8" />;
  if (f.includes("support")) return <Info className="w-8 h-8" />;
  if (f.includes("quality")) return <Shield className="w-8 h-8" />;
  return <CheckCircle className="w-8 h-8" />;
};

// ─── Star Renderer ─────────────────────────────────────────────────────────────
const renderStars = (count = 5) =>
  Array.from({length: 5}, (_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${
        i < count ? "text-orange-400 fill-orange-400" : "text-gray-300"
      }`}
    />
  ));

// ─── Expandable Description ────────────────────────────────────────────────────
function ExpandableDescription({description}) {
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;
  const words = description.split(/\s+/);
  const truncated = words.slice(0, 29).join(" ");
  return (
    <span className="text-gray-700">
      {expanded ? description : truncated}
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
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetailsPage() {
  const {id} = useParams();
  const dispatch = useDispatch();
  const {single: product, loading, error} = useSelector((s) => s.products);
  const {user} = useSelector((s) => s.auth);
  const {trackEvent} = useGAEvent();
  const {trackViewContent: trackMetaViewContent} = useMetaPixelEvent();
  const {trackViewContent: trackTikTokViewContent} = useTikTokEvent();

  // ── State ──────────────────────────────────────────────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({x: 50, y: 50});
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [fullViewImage, setFullViewImage] = useState(null);

  const limit = 5;

  // ── Static Data ────────────────────────────────────────────────────────────
  const points = [
    {img: "/express.png", text: "Fast And Reliable Delivery"},
    {img: "/calender.png", text: "7 Days Return"},
    {img: "/support.png", text: "24/7 Support"},
    {img: "/certified.png", text: "Best Quality from many years in the market"},
  ];

  const deliveryOptions = [
    {text: "Regular Delivery: 2–3 Days (Lagos), 3–5 Days (Interstate)"},
    {text: "Express Delivery (Within 24 hours, for orders placed before 10am)"},
  ];

  // ── GA Tracking ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    trackEvent("view_item", {
      item_id: product._id,
      item_name: product.name,
      currency: "NGN",
      value: product.price,
      items: [
        {item_id: product._id, item_name: product.name, price: product.price},
      ],
    });
  }, [product?._id, product?.name, product?.price, trackEvent]);

  // ── Meta Pixel ViewContent Tracking ───────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    trackMetaViewContent(product);
  }, [product?._id, trackMetaViewContent]);

  // ── TikTok ViewContent Tracking ───────────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    trackTikTokViewContent(product);
  }, [product?._id, trackTikTokViewContent]);

  // ── Fetch Product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (id && (!product || product._id !== id)) {
      dispatch(getProduct(id));
    }
  }, [dispatch, id, product]);

  useEffect(() => {
    if (product?._id) {
      dispatch(addRecentlyViewed(product));
      setSelectedImageId("main");
      setSelectedColor(product.colors?.length > 0 ? product.colors[0] : null);
    }
  }, [product?._id, dispatch]);

  // ── Fetch Related Products ─────────────────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    const fetchRelated = async () => {
      try {
        const res = await axios.get(`/api/products/${product._id}/related`);
        setRelatedProducts(res.data?.related || []);
      } catch {
        try {
          const res = await axios.get(
            `/api/products?category=${encodeURIComponent(product.category)}&limit=6`,
          );
          const items = res.data?.products || res.data || [];
          setRelatedProducts(
            items.filter((p) => p._id !== product._id).slice(0, 5),
          );
        } catch {
          setRelatedProducts([]);
        }
      }
    };
    fetchRelated();
  }, [product?._id]);

  // ── Fetch Comments ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/products/${id}/comments`)
      .then((res) =>
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved"),
        ),
      )
      .catch((err) => console.error("Error fetching comments:", err));
  }, [id]);

  // ── ESC Key for Full View ──────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setFullViewImage(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // ── Auto-scroll to reviews section if hash is present ─────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#reviews-section") {
      const element = document.getElementById("reviews-section");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
  }, []);

  // ── Pagination & Filtering ─────────────────────────────────────────────────
  const filteredComments = useMemo(() => {
    const base =
      selectedRatings.length === 0
        ? [...comments]
        : comments.filter((c) => selectedRatings.includes(c.rating ?? 5));
    return base.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [comments, selectedRatings]);

  const totalPages = Math.ceil(filteredComments.length / limit);

  const paginatedComments = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredComments.slice(start, start + limit);
  }, [filteredComments, page]);

  const handleRatingFilter = (rating) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
    setPage(1);
  };

  const clearRatingFilters = () => {
    setSelectedRatings([]);
    setPage(1);
  };

  // ── Accordion Items ────────────────────────────────────────────────────────
  const accordionItems = useMemo(
    () => [
      {
        title: `Rating${selectedRatings.length > 0 ? ` (${selectedRatings.length})` : ""}`,
        content: (
          <div>
            {selectedRatings.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedRatings.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-filgreen text-white text-xs rounded-full"
                  >
                    {r}★
                    <button
                      onClick={() => handleRatingFilter(r)}
                      className="hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearRatingFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
            {[5, 4, 3, 2, 1].map((star) => {
              const count = comments.filter(
                (c) => (c.rating ?? 5) === star,
              ).length;
              return (
                <label
                  key={star}
                  className="flex items-center gap-2 py-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(star)}
                    onChange={() => handleRatingFilter(star)}
                    className="sr-only"
                  />
                  <span
                    className={`flex justify-center items-center border rounded w-4 h-4 transition-colors shrink-0 ${
                      selectedRatings.includes(star)
                        ? "bg-black border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRatings.includes(star) && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 flex items-center justify-between">
                    <span>
                      {star} Star{star > 1 ? "s" : ""}
                    </span>
                    <span className="text-gray-400">({count})</span>
                  </div>
                </label>
              );
            })}
          </div>
        ),
      },
    ],
    [selectedRatings, comments],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      await axios.post(`/api/products/${id}/comments`, {
        text: commentText,
        rating: commentRating,
      }, { withCredentials: true });
      setCommentText("");
      setCommentRating(5);
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to post comment. Please log in.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return alert("Please log in to like reviews");

    // 1. Optimistic update immediately
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const currentLikes = typeof c.likes === "number" ? c.likes : c.likes?.length ?? 0;
        const alreadyLiked = c.isLiked;
        return {
          ...c,
          likes: alreadyLiked ? currentLikes - 1 : currentLikes + 1,
          dislikes: typeof c.dislikes === "number" ? c.dislikes : c.dislikes?.length ?? 0,
          isLiked: !alreadyLiked,
          isDisliked: false,
        };
      })
    );

    try {
      // 2. Confirm with server
      const res = await axios.post(
        `/api/products/${id}/comments/${commentId}/like`,
        {},
        { withCredentials: true }
      );
      // 3. Reconcile with actual server values
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                isLiked: res.data.isLiked,
                isDisliked: res.data.isDisliked,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      // 4. Revert on error - refetch comments to restore correct state
      try {
        const res = await axios.get(`/api/products/${id}/comments`, { withCredentials: true });
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved")
        );
      } catch (fetchErr) {
        console.error("Error refetching comments:", fetchErr);
      }
    }
  };

  const handleDislike = async (commentId) => {
    if (!user) return alert("Please log in to dislike reviews");

    // 1. Optimistic update immediately
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const currentDislikes = typeof c.dislikes === "number" ? c.dislikes : c.dislikes?.length ?? 0;
        const alreadyDisliked = c.isDisliked;
        return {
          ...c,
          likes: typeof c.likes === "number" ? c.likes : c.likes?.length ?? 0,
          dislikes: alreadyDisliked ? currentDislikes - 1 : currentDislikes + 1,
          isLiked: false,
          isDisliked: !alreadyDisliked,
        };
      })
    );

    try {
      // 2. Confirm with server
      const res = await axios.post(
        `/api/products/${id}/comments/${commentId}/dislike`,
        {},
        { withCredentials: true }
      );
      // 3. Reconcile with actual server values
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                isLiked: res.data.isLiked,
                isDisliked: res.data.isDisliked,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      // 4. Revert on error - refetch comments to restore correct state
      try {
        const res = await axios.get(`/api/products/${id}/comments`, { withCredentials: true });
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved")
        );
      } catch (fetchErr) {
        console.error("Error refetching comments:", fetchErr);
      }
    }
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setZoomOrigin({x, y});
      setIsZoomed(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="h-screen">
        <Loading />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out ${product.name} on FIL Store!`;
  // Map all images from all colors into the carousel with unique IDs
  const colorImages = product.colors?.flatMap((color, colorIdx) =>
    (color.images || []).map((img, imgIdx) => ({
      id: `${color._id}-${imgIdx}`,
      url: img,
      colorName: color.name
    }))
  ) || [];
  const secondaryImagesWithIds = (product.secondaryImages || []).map((img, idx) => ({
    id: `secondary-${idx}`,
    url: img
  }));
  const currentImages = [
    { id: "main", url: product.image },
    ...colorImages,
    ...secondaryImagesWithIds
  ];
  const selectedImage = currentImages.find(img => img.id === selectedImageId)?.url || product.image;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[1140px]">
      {/* ── Review Submitted Toast ── */}
      <div
        className="fixed bottom-6 left-1/2 z-[9999] pointer-events-none transition-all duration-400"
        style={{
          transform: commentSubmitted
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(16px)",
          opacity: commentSubmitted ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3.5 shadow-2xl min-w-[300px]">
          <div className="w-8 h-8 rounded-full bg-[#6ae8a015] border border-[#6ae8a033] flex items-center justify-center shrink-0 text-sm">
            ✓
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#e8e8e8]">
              Review submitted!
            </p>
            <p className="text-[11px] text-[#6ae8a0] mt-0.5">
              Your review is pending approval and will appear shortly.
            </p>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 py-4 px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <Link
          href="/"
          className="hover:text-filgreen transition-colors whitespace-nowrap"
        >
          Homepage
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <Link
          href="/products"
          className="hover:text-filgreen transition-colors whitespace-nowrap"
        >
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <Link
              href={`/products?categories=${encodeURIComponent(product.category)}`}
              className="hover:text-filgreen transition-colors whitespace-nowrap capitalize"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-gray-900 font-medium truncate max-w-[250px]">
          {product.name}
        </span>
      </nav>

      {/* ── Product Section ── */}
      <div className="md:flex gap-3 border-dashed border-b-3 border-gray-200 md:py-5 nav:gap-6">
        {/* Left — Images */}
        <div className="flex flex-col mx-5 md:max-w-[50%] items-center gap-4 md:gap-10 mt-3 md:mt-12 basis-[546px]">
          {/* Main Image */}
          <div className="flex w-full gap-3">
            <div
              className="flex-1 aspect-square max-h-[480px] overflow-hidden relative bg-[#fafafa] rounded-lg"
              style={{cursor: isZoomed ? "zoom-out" : "zoom-in"}}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  width={480}
                  height={480}
                  className="w-full h-full object-contain transition-transform duration-300 ease-out"
                  style={{
                    transform: isZoomed ? "scale(2)" : "scale(1)",
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  }}
                  onClick={handleImageClick}
                  draggable={false}
                  priority
                  sizes="(max-width: 768px) 100vw, 480px"
                  quality={90}
                />
              ) : (
                <div className="flex justify-center items-center w-full h-full text-gray-400 bg-gray-100">
                  <p className="text-sm">Image not available</p>
                </div>
              )}
            </div>

            {/* Side Actions */}
            <div className="flex flex-col justify-between items-center py-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-4 h-4 text-gray-600" />
                </button>
                <WishlistButtonPD
                  product={product}
                  selectedColor={selectedColor}
                  className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                />
                <button
                  onClick={() => setFullViewImage(selectedImage)}
                  className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Full view"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const i = currentImages.findIndex(img => img.id === selectedImageId);
                    const newImage = currentImages[i === 0 ? currentImages.length - 1 : i - 1];
                    setSelectedImageId(newImage.id);
                    setIsZoomed(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    const i = currentImages.findIndex(img => img.id === selectedImageId);
                    const newImage = currentImages[i === currentImages.length - 1 ? 0 : i + 1];
                    setSelectedImageId(newImage.id);
                    setIsZoomed(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center bg-[#fafafa] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex md:justify-center gap-3 pt-4 pb-2 w-full overflow-x-auto px-4 sm:px-0">
            {currentImages.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  setSelectedImageId(img.id);
                  setIsZoomed(false);
                }}
                className={`w-[65px] bg-[#fafafa] h-[65px] flex-shrink-0 rounded-lg border-2 overflow-hidden p-1.5 transition-all ${
                  selectedImageId === img.id
                    ? "border-filgreen"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail`}
                  width={65}
                  height={65}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  sizes="65px"
                  quality={75}
                />
              </button>
            ))}
          </div>

          {/* Product Features */}
          {product.features?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6 w-full border-t border-gray-200 pt-6">
              {product.features.slice(0, 4).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center gap-2"
                >
                  {getFeatureIcon(feat)}
                  <span className="text-xs font-medium text-gray-700">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Product Videos */}
          {product.videos?.length > 0 && (
            <div className="self-start mt-[38px] w-full">
              <h3 className="mx-2 font-oswald font-medium text-2xl">
                Product Live Cam
              </h3>
              <div className="flex gap-2 md:gap-4 mx-2 my-4">
                {product.videos.map((video, index) => (
                  <div key={index} className="relative w-full">
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
                          <Image src="/play.svg" alt="play" width={50} height={50} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="flex flex-col md:max-w-[50%] gap-5 p-4 sm:p-6 lg:p-8">
          {/* Save Badge */}
          {product.originalPrice && (
            <div className="border-2 border-black text-black text-xs font-medium px-4 py-1.5 rounded-full w-fit">
              Save{" "}
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100,
              )}
              %
            </div>
          )}

          {/* Title */}
          <h1 className="font-oswald font-medium text-2xl md:text-3xl text-gray-900">
            {product.name}
          </h1>

          {/* Price & Rating */}
          <div className="flex border-dashed pb-10 border-gray-200 border-b-3 flex-wrap items-center gap-3">
            {product.originalPrice && (
              <span className="text-gray-400 text-lg line-through">
                {formatAmount(product.originalPrice)}
              </span>
            )}
            <span className="font-semibold text-2xl text-gray-900">
              {formatAmount(product.price)}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <svg
                className="text-orange-400"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-medium">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
            {product.soldCount > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                {product.soldCount} sold
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="font-semibold text-sm text-gray-900 mb-1">
              Description:
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              <ExpandableDescription description={product.description} />
            </p>
          </div>

         {/* Colors */}
{product.colors?.length > 0 && (
  <div>
    <p className="text-md font-bold text-gray-500 mb-2">
      Color:{" "}
      <span className="font-bold text-black">
        {selectedColor?.name || "Select a color"}
      </span>
    </p>
    <div className="flex items-center gap-3">
      {product.colors.map((color, idx) => (
        <button
          key={idx}
          className={`w-14 h-8 rounded-md transition-all ${
            selectedColor === color
              ? "ring-2 ring-gray-400 ring-offset-4"
              : "ring-0"
          }`}
          style={{ backgroundColor: color.name.toLowerCase() }}
          onClick={() => {
            setSelectedColor(color);
            setIsZoomed(false);
          }}
          title={color.name}
        />
      ))}
    </div>
  </div>
)}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <AddToCartButton
              className="flex-1 bg-[#1a1a1a] text-white font-medium py-3.5 px-6 rounded-lg hover:bg-black transition-colors text-sm"
              product={product}
              selectedColor={selectedColor}
            />
            <BuyNow
              className="flex-1 bg-white text-gray-900 font-medium py-3.5 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              product={product}
            />
          </div>

          {/* Services & Benefits */}
          <div className="mt-4">
            <h3 className="font-oswald font-medium text-xl mb-3">
              Services and Benefits
            </h3>
            <div className="space-y-0">
              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-3 border-b border-gray-100"
                >
                  <Image
                    src={point.img}
                    alt={point.text}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain"
                  />
                  <p className="text-sm text-gray-700">{point.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-2">
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-700">Payment method</p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Image
                width={100}
                height={40}
                src="/paystack.png"
                alt="paystack"
              />
            </div>
          </div>

          {/* Delivery Method */}
          <div className="mt-2">
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <Truck className="w-7 h-7 text-gray-600" />
              <div className="flex items-center gap-2">
                <p className="text-black text-md font-bold">Delivery method</p>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-600 cursor-pointer" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-80 p-3 shadow-2xl bg-white text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Delivery within Lagos is 2-3 working days and outside Lagos
                    is 3-5 working days.
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-0">
              {deliveryOptions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-3 border-b border-gray-100"
                >
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="mt-14 border-dashed border-b-3 border-gray-200 md:pb-20 pt-10 px-1">
          <div className="flex max-sm:px-5 items-center justify-between mb-5">
            <h2 className="font-oswald font-medium text-2xl md:text-3xl">
              Related Product
            </h2>
            <Link
              href={`/products?categories=${encodeURIComponent(product.category || "")}`}
              className="text-sm text-filgreen font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {relatedProducts.map((rp) => (
              <Link
                key={rp._id}
                href={`/products/${rp._id}`}
                className="snap-start flex-shrink-0 w-[190px] sm:w-[210px] rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={rp.image}
                    alt={rp.name}
                    width={210}
                    height={210}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">
                    {rp.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {rp.originalPrice && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatAmount(rp.originalPrice)}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmount(rp.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <svg
                      className="text-orange-400 w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-[11px] font-medium text-gray-700">
                      {(rp.averageRating || 0).toFixed(1)}
                    </span>
                    {rp.soldCount > 0 && (
                      <span className="text-[11px] text-gray-400 ml-1">
                        {rp.soldCount} Sold
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Overview ── */}
      <section className="mt-12 mx-5">
        <h2 className="font-oswald font-medium text-2xl md:text-3xl mb-6">
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {currentImages
            .slice(0, 8)
            .map((img, idx) => (
              <div
                key={img.id}
                className={`group relative overflow-hidden border border-[#eee] rounded-2xl md:rounded-3xl ${
                  idx === 0
                    ? "col-span-2 row-span-2 aspect-square"
                    : "aspect-square"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Overview ${idx + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <button
                  onClick={() => setFullViewImage(img.url)}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg"
                >
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* ── Product Reviews ── */}
      <div id="reviews-section" className="max-w-4xl mx-auto my-20 px-4">
        <h2 className="font-oswald font-medium text-2xl md:text-3xl mb-6">
          Product Reviews
        </h2>

        {/* Top: Rating Summary */}
        <div className="border-dashed border-2 p-5 md:p-10 rounded-md border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Score */}
            <div className="flex flex-row items-center gap-1 shrink-0 min-w-[80px]">
              <div className="relative w-16 h-16">
                <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#f3f4f6"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#FB923C"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - product.averageRating / 5)}`}
                    className="transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-500">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-2' >
                <div className="flex  items-center gap-0.5">
                {renderStars(Math.round(product.averageRating))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                from {product.ratingsCount} reviews
              </p>
              </div>
            </div>

            {/* Bars */}
            <div className="w-full md:flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  product.ratings?.filter((r) => r.value === star).length || 0;
                const percentage =
                  product.ratingsCount > 0
                    ? (count / product.ratingsCount) * 100
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-0.5 w-14 md:w-12 shrink-0">
                      <span className="text-xs text-gray-600">{star}.0</span>
                      <svg
                        className="w-3 h-3 text-orange-400 fill-orange-400 flex-shrink-0"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 h-3 bg-gray-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-sm transition-all duration-500"
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 md:w-8 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom: Filter + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filter */}
          <div className="hidden lg:block border-2 border-dashed max-h-fit border-gray-200 md:p-5 rounded-md lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Reviews Filter
            </h3>
            <Accordion
              items={accordionItems}
              defaultOpenIndex={0}
              headerClassName="text-sm py-1.5 px-3 rounded hover:bg-gray-50 cursor-pointer"
              contentClassName="pl-2"
            />
          </div>

          {/* Review List */}
          <div className="lg:col-span-9">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Review Lists
            </h3>

            {/* Add Review Form */}
            {user ? (
              <div className="mb-8 pb-8 border-b border-gray-100">
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length <= 100) setCommentText(e.target.value);
                    }}
                    rows={3}
                    placeholder="Write your review here..."
                    className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-filgreen rounded-lg text-sm transition-all resize-none"
                    required
                  />
                  
                  {/* Star Rating Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="transition-colors hover:scale-110"
                          title={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= commentRating
                                ? "text-orange-400 fill-orange-400"
                                : "text-gray-300 hover:text-orange-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {commentRating} star{commentRating > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {commentText.trim() === ""
                        ? 0
                        : commentText.trim().split(/\s+/).length}
                      /100 words
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-filgreen text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-filgreen-dark transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Posting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-8">
                <a
                  href="/login"
                  className="text-filgreen text-sm hover:underline"
                >
                  Log in
                </a>{" "}
                to leave a review.
              </div>
            )}

            {/* Reviews */}
            {paginatedComments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {paginatedComments.map((comment, index) => (
                  <div key={index} className="py-5 first:pt-0">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {renderStars(
                        comment.rating ?? 5
                      )}
                    </div>

                    {/* Text */}
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {comment.title || comment.text}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* User */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                          {comment.user?.avatar ? (
                            <Image
                              src={comment.user.avatar}
                              alt=""
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">
                              {typeof comment.user === "object"
                                ? comment.user?.firstName
                                    ?.charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {typeof comment.user === "object"
                            ? comment.user?.firstName ||
                              comment.user?.name ||
                              "User"
                            : "User"}
                        </span>
                      </div>

                      {/* Like / Dislike */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(comment._id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.isLiked
                              ? "text-filgreen"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`}
                          />
                          <span>{typeof comment.likes === 'number' ? comment.likes : comment.likes?.length ?? 0}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(comment._id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.isDisliked
                              ? "text-red-500"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <ThumbsDown
                            className={`w-4 h-4 ${comment.isDisliked ? "fill-current" : ""}`}
                          />
                          <span>{typeof comment.dislikes === 'number' ? comment.dislikes : comment.dislikes?.length ?? 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-sm"
                >
                  ‹
                </button>
                {Array.from({length: totalPages}, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
                        page === n
                          ? "bg-filgreen border-filgreen text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 text-sm px-1">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-sm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-oswald font-medium text-xl">
                Share this product
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-6 mb-6">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 bg-filgreen text-white rounded-md text-xs font-medium hover:bg-filgreen-dark transition-colors"
              >
                {linkCopied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {linkCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full View Modal ── */}
      {fullViewImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullViewImage(null)}
        >
          <div
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullViewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={fullViewImage}
              alt="Full view"
              width={1200}
              height={800}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}