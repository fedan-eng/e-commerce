// Helpers shared by the Creators section and its full-screen player.
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

export function safePlay(videoEl) {
  const p = videoEl.play();
  videoEl._pendingPlay = p;
  if (p !== undefined) p.catch(() => {});
}

export function safePause(videoEl, resetTime = false) {
  const pending = videoEl._pendingPlay;
  if (pending !== undefined) {
    pending
      .then(() => {
        videoEl.pause();
        if (resetTime) videoEl.currentTime = 0;
      })
      .catch(() => {});
    videoEl._pendingPlay = undefined;
  } else {
    videoEl.pause();
    if (resetTime) videoEl.currentTime = 0;
  }
}

export function applyIOSInlineAttributes(el) {
  if (!el) return;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("x5-playsinline", "");
  el.setAttribute("x5-video-player-type", "h5");
  el.setAttribute("x5-video-player-fullscreen", "false");
}

export function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

// Must run inside the tap that opens the player: browsers only allow fullscreen from a user gesture.
// iPhone Safari has no page-level fullscreen, so there the player's fixed overlay covers the screen.
export function enterFullscreen() {
  const el = document.documentElement;
  const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
  if (!request || fullscreenElement()) return;
  try {
    request.call(el)?.catch?.(() => {});
  } catch {}
}

export function exitFullscreen() {
  if (!fullscreenElement()) return;
  const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
  try {
    exit?.call(document)?.catch?.(() => {});
  } catch {}
}

// Until a video's product id is filled in, the link goes to its category page
export function productHref(product) {
  return product.id ? `/products/${product.id}` : product.href;
}

export const formatPrice = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export function ProductThumb({ product, className = "", iconSize = 12 }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden bg-white ${className}`}>
      {product.thumb ? (
        <img src={product.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <ShoppingBag size={iconSize} className="text-[#082C17]" />
      )}
    </span>
  );
}

// Small "shop this" chip that sits above a card's title
export function ProductPill({ product, className = "" }) {
  return (
    <Link
      href={productHref(product)}
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto inline-flex max-w-full items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/15 py-1 pl-1 pr-2.5 text-[11px] font-semibold backdrop-blur-md transition-colors hover:bg-white/25 sm:text-[12px] ${className}`}
    >
      <ProductThumb product={product} className="h-5 w-5 rounded-full" iconSize={11} />
      <span className="truncate">{product.name}</span>
      <ArrowUpRight size={12} className="shrink-0 opacity-80" />
    </Link>
  );
}
