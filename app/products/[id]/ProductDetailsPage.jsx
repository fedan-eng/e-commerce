"use client";

import {useEffect, useState, lazy, Suspense} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "next/navigation";
import {addRecentlyViewed} from "@/store/features/recentlyViewedSlice";
import {getProduct} from "@/store/features/productSlice";
import Loading from "@/components/Loading";
import axios from "axios";
import {
  Share,
  ChevronRight,
  Copy,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CheckoutModal from "@/components/CheckoutModal";

// Lazy load heavy components
const ProductGallery = lazy(() => import("./components/ProductGallery"));
const ProductDetailsInfo = lazy(() => import("./components/ProductDetailsInfo"));
const ProductVideos = lazy(() => import("./components/ProductVideos"));
const ProductReviews = lazy(() => import("./components/ProductReviews"));
const RelatedProductsSection = lazy(() => import("./RelatedProductsSection"));



// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetailsPage({ product: productProp }) {
  const {id} = useParams();
  const dispatch = useDispatch();
  const {single: productFromStore, loading: storeLoading, error: storeError} = useSelector((s) => s.products);
  const {user} = useSelector((s) => s.auth);

  // Use product from props if available, otherwise fall back to store
  const product = productProp ?? productFromStore;
  // Derive loading and error: if we have product from props, we don't need to wait for store loading
  const loading = storeLoading && !productProp;
  const error = storeError && !productProp;

  // ── State ──────────────────────────────────────────────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [fullViewImage, setFullViewImage] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);

  // ── Deferred Tracking (Non-critical) ─────────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    // Defer tracking to avoid blocking initial render
    const timer = setTimeout(async () => {
      try {
        const { useGAEvent } = await import("@/hooks/useGAEvent");
        const { trackEvent } = useGAEvent();
        trackEvent("view_item", {
          item_id: product._id,
          item_name: product.name,
          currency: "NGN",
          value: product.price,
          items: [
            {item_id: product._id, item_name: product.name, price: product.price},
          ],
        });
      } catch (err) {
        console.error("GA tracking failed:", err);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [product?._id, product?.name, product?.price]);

  useEffect(() => {
    if (!product?._id) return;
    const timer = setTimeout(async () => {
      try {
        const { useMetaPixelEvent } = await import("@/hooks/useMetaPixelEvent");
        const { trackViewContent } = useMetaPixelEvent();
        trackViewContent(product);
      } catch (err) {
        console.error("Meta Pixel tracking failed:", err);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [product?._id, product]);

  useEffect(() => {
    if (!product?._id) return;
    const timer = setTimeout(async () => {
      try {
        const { useTikTokEvent } = await import("@/hooks/useTikTokEvent");
        const { trackViewContent } = useTikTokEvent();
        trackViewContent(product);
      } catch (err) {
        console.error("TikTok tracking failed:", err);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [product?._id, product]);

  // ── Fetch Product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (id && (!productFromStore || productFromStore._id !== id) && !productProp) {
      dispatch(getProduct(id));
    }
  }, [dispatch, id, productFromStore, productProp]);

  useEffect(() => {
    if (product?._id) {
      dispatch(addRecentlyViewed(product));
      setSelectedColor(product.colors?.length > 0 ? product.colors[0] : null);
    }
  }, [product?._id, dispatch]);

  // ── Fetch Related Products ─────────────────────────────────────────────────
  useEffect(() => {
    if (!product?._id) return;
    const abortController = new AbortController();
    const fetchRelated = async () => {
      try {
        const res = await axios.get(`/api/products/${product._id}/related`, {
          signal: abortController.signal
        });
        setRelatedProducts(res.data?.related || []);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          try {
            const res = await axios.get(
              `/api/products?category=${encodeURIComponent(product.category)}&limit=6`,
              { signal: abortController.signal }
            );
            const items = res.data?.products || res.data || [];
            setRelatedProducts(
              items.filter((p) => p._id !== product._id).slice(0, 5),
            );
          } catch {
            setRelatedProducts([]);
          }
        }
      }
    };
    fetchRelated();
    return () => abortController.abort();
  }, [product?._id, product.category]);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      color: selectedColor?.name || null,
    });
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[1140px]">
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
        <Suspense fallback={<div className="md:flex-1 h-[600px] bg-gray-100 animate-pulse" />}>
          <ProductGallery 
            product={product} 
            selectedColor={selectedColor}
            onFullViewImage={setFullViewImage}
            onShareModal={setShowShareModal}
          />
        </Suspense>

        <Suspense fallback={<div className="md:flex-1 h-[600px] bg-gray-100 animate-pulse" />}>
          <ProductDetailsInfo 
            product={product}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            onBuyNow={handleBuyNow}
          />
        </Suspense>
      </div>

      {/* ── Product Videos ── */}
      <Suspense fallback={<div className="h-[200px] bg-gray-100 animate-pulse mx-5 mt-8" />}>
        <ProductVideos videos={product.videos} />
      </Suspense>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <Suspense fallback={<div className="h-[300px] bg-gray-100 animate-pulse mt-14" />}>
          <RelatedProductsSection relatedProducts={relatedProducts} product={product} />
        </Suspense>
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
                  loading="lazy"
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
      <Suspense fallback={<div className="h-[400px] bg-gray-100 animate-pulse my-20" />}>
        <ProductReviews product={product} user={user} id={id} />
      </Suspense>

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
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* ── Checkout Modal for Buy Now ── */}
      {buyNowItem && (
        <CheckoutModal
          buyNowItem={buyNowItem}
          onClose={() => setBuyNowItem(null)}
        />
      )}
    </div>
  );
}