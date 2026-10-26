"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRecentlyViewed } from "@/store/features/recentlyViewedSlice";
import { getCategoryByDbName } from "@/lib/categories";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import useProductViewTracking from "./useProductViewTracking";
import { getGalleryImages, getHighlights, getImageBg } from "./productUtils";
import { Container } from "./components/ui";
import Breadcrumbs from "./components/Breadcrumbs";
import ProductGallery from "./components/ProductGallery";
import ProductInfo, { StockStatus } from "./components/ProductInfo";
import ServicesCard from "./components/ServicesCard";
import DeliveryOptions from "./components/DeliveryOptions";
// import ProductOverview from "./components/ProductOverview";
import { InTheBox } from "./components/ProductSpecs";
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
      {/* ── Hero: gallery + buy box ── */}
      <Container className="pb-14 pt-5 md:pb-20 md:pt-8">
        <Breadcrumbs items={getBreadcrumbs(product)} />

        <div className="mt-5 grid grid-cols-1 gap-8 md:mt-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-6 lg:gap-12">
            <ProductGallery
              key={selectedColor?._id || "all"}
              product={product}
              images={galleryImages}
              imageBg={imageBg}
              onShare={() => setShareOpen(true)}
              onOpenImage={setLightboxSrc}
            />
            {/* In the box sits under the gallery on desktop, after the buy box on mobile */}
            <div className="hidden lg:block">
              <InTheBox productName={product.name} boxContent={product.boxContent} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <ProductInfo
              product={product}
              highlights={highlights}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onCheckout={openCheckout}
            />
            <div className="lg:hidden">
              <InTheBox productName={product.name} boxContent={product.boxContent} />
            </div>
            <DeliveryOptions />
            <StockStatus inStock={product.availability !== false} />
            <ServicesCard />
          </div>
        </div>
        <div className="mt-14 border-t border-dashed border-line md:mt-20" />
      </Container>

      {/* Overview images taken down for now — to restore, render
          <ProductOverview productName={product.name} media={getOverviewMedia(product)} onOpenImage={setLightboxSrc} /> */}
      <ProductReviews product={product} user={user} />
      <RelatedProducts product={product} />

      {shareOpen && <ShareModal productName={product.name} onClose={closeShare} />}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={product.name} onClose={closeLightbox} />}
      {buyNowItem && <CheckoutModal buyNowItem={buyNowItem} onClose={() => setBuyNowItem(null)} />}
    </div>
  );
}
