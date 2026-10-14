"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { addRecentlyViewed } from "@/store/features/recentlyViewedSlice";
import { getCategoryByDbName } from "@/lib/categories";
import CheckoutModal from "@/components/CheckoutModal";
import useProductViewTracking from "./useProductViewTracking";
import { getGalleryImages, getHighlights, getImageBg, getOverviewMedia, getSpecRows } from "./productUtils";
import { Container } from "./components/ui";
import Breadcrumbs from "./components/Breadcrumbs";
import ProductGallery from "./components/ProductGallery";
import ProductHighlights from "./components/ProductHighlights";
import ProductInfo from "./components/ProductInfo";
import ServicesCard from "./components/ServicesCard";
import DeliveryOptions from "./components/DeliveryOptions";
import ProductOverview from "./components/ProductOverview";
import ProductSpecs from "./components/ProductSpecs";
import ProductReviews from "./components/reviews/ProductReviews";
import RelatedProducts from "./components/RelatedProducts";
import ShareModal from "./components/ShareModal";
import ImageLightbox from "./components/ImageLightbox";

function getBreadcrumbs(product) {
  const category = getCategoryByDbName(product.category);
  return [
    { label: "Home", href: "/" },
    category
      ? { label: category.title, href: `/products/${category.slug}` }
      : { label: "Products", href: "/products" },
    { label: product.name },
  ];
}

export default function ProductDetailsPage({ product }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);

  const closeShare = useCallback(() => setShareOpen(false), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useProductViewTracking(product);

  useEffect(() => {
    dispatch(addRecentlyViewed(product));
  }, [dispatch, product]);

  const galleryImages = useMemo(() => getGalleryImages(product, selectedColor), [product, selectedColor]);
  const highlights = useMemo(() => getHighlights(product), [product]);
  const overviewMedia = useMemo(() => getOverviewMedia(product), [product]);
  const specRows = useMemo(() => getSpecRows(product), [product]);
  const imageBg = getImageBg(product);

  const openCheckout = (quantity) =>
    setBuyNowItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: selectedColor?.images?.[0] || product.image,
      quantity,
      color: selectedColor?.name || null,
    });

  return (
    <div className="bg-white text-forest">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 999, fontSize: 14 } }} />

      {/* ── Hero: gallery + buy box ── */}
      <Container className="pb-14 pt-5 md:pb-20 md:pt-8">
        <Breadcrumbs items={getBreadcrumbs(product)} />

        <div className="mt-5 grid grid-cols-1 gap-8 md:mt-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-12">
            <ProductGallery
              key={selectedColor?._id || "all"}
              product={product}
              images={galleryImages}
              imageBg={imageBg}
              onShare={() => setShareOpen(true)}
              onOpenImage={setLightboxSrc}
            />
            {/* Highlights sit under the gallery on desktop, after the buy box on mobile */}
            <div className="hidden lg:block">
              <ProductHighlights highlights={highlights} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <ProductInfo
              product={product}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onCheckout={openCheckout}
            />
            <div className="lg:hidden">
              <ProductHighlights highlights={highlights} />
            </div>
            <ServicesCard />
            <DeliveryOptions />
          </div>
        </div>
      </Container>

      <ProductOverview productName={product.name} media={overviewMedia} onOpenImage={setLightboxSrc} />
      <ProductSpecs rows={specRows} boxContent={product.boxContent} />
      <ProductReviews product={product} user={user} />
      <RelatedProducts product={product} />

      {shareOpen && <ShareModal productName={product.name} onClose={closeShare} />}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={product.name} onClose={closeLightbox} />}
      {buyNowItem && <CheckoutModal buyNowItem={buyNowItem} onClose={() => setBuyNowItem(null)} />}
    </div>
  );
}
