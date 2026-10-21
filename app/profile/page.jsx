"use client";
// app/profile/page.jsx — the account area: details, orders, wishlist and password.
// The tab lives in ?tab= so links like /profile?tab=My%20Orders open the right one.
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Heart, Lock, LogOut, Package, UserRound } from "lucide-react";
import Loading from "@/components/Loading";
import LogoutButton from "@/components/LogoutButton";
import DetailsForm from "@/components/profile/DetailsForm";
import PasswordForm from "@/components/profile/PasswordForm";
import OrdersTab from "@/components/profile/orders/OrdersTab";
import WishlistTab from "@/components/profile/WishlistTab";

// Keys match the ?tab= values the navbar and profile menu already link to
const TABS = [
  { key: "General Information", label: "My details", icon: UserRound, Content: DetailsForm },
  { key: "My Orders", label: "My orders", icon: Package, Content: OrdersTab },
  { key: "Wishlist", label: "Wishlist", icon: Heart, Content: WishlistTab },
  { key: "Change Password", label: "Password", icon: Lock, Content: PasswordForm },
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((s) => s.auth.user);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);

  const active = TABS.find((t) => t.key === searchParams.get("tab")) || TABS[0];
  const { Content } = active;
  const initial = (user?.firstName?.[0] || user?.email?.[0] || "F").toUpperCase();

  const select = (key) => router.replace(`/profile?tab=${encodeURIComponent(key)}`, { scroll: false });

  return (
    <main className="font-roboto">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 md:pt-12">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-forest text-xl font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <span className="inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
                My account
              </span>
              <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tight text-forest md:text-[34px]">
                Hi, {user?.firstName || "there"}
              </h1>
              <p className="break-all text-sm text-muted">{user?.email}</p>
            </div>
          </div>
          <LogoutButton className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-filred hover:bg-[#fde8e8] hover:text-filred">
            <LogOut size={16} /> Log out
          </LogoutButton>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          {/* ── Tabs: a scrolling row on mobile, a list on desktop ── */}
          <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:overflow-visible lg:px-0">
            <ul className="flex gap-2 lg:flex-col lg:gap-1 lg:rounded-[24px] lg:bg-sage lg:p-2">
              {TABS.map(({ key, label, icon: Icon }) => {
                const isActive = key === active.key;
                return (
                  <li key={key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => select(key)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-2xl lg:py-3 ${
                        isActive ? "bg-forest text-white" : "bg-sage text-forest hover:bg-mint lg:bg-transparent lg:hover:bg-white"
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                      {key === "Wishlist" && wishlistCount > 0 && (
                        <span
                          className={`ml-auto rounded-full px-2 text-xs ${isActive ? "bg-white/20 text-white" : "bg-white text-forest"}`}
                        >
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0">
            <Content />
          </div>
        </div>
      </div>
    </main>
  );
}

function SignedOut() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12 font-roboto">
      <div className="w-full max-w-md rounded-[28px] bg-sage p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-forest">
          <UserRound size={24} />
        </span>
        <h1 className="mt-5 text-[26px] font-bold tracking-tight text-forest">Your FIL account</h1>
        <p className="mt-2 text-[15px] text-muted">Sign in to see your orders, saved items and details.</p>
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/login?callbackUrl=/profile"
            className="flex h-12 items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Sign in
          </Link>
          <Link
            href="/register?callbackUrl=/profile"
            className="flex h-12 items-center justify-center rounded-full border border-line bg-white text-[15px] font-semibold text-forest transition-colors hover:border-forest"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, authChecked } = useSelector((s) => s.auth);

  // Wait for the first account check so signed-in shoppers don't see "Sign in" flash
  if (!authChecked && !isAuthenticated) return <Loading />;

  return <Suspense fallback={<Loading />}>{isAuthenticated ? <ProfileContent /> : <SignedOut />}</Suspense>;
}
