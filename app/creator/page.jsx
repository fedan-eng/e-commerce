// app/creator/page.jsx — a creator's own dashboard (role "creator"; admins add ?code=CODE)
import { Suspense } from "react";
import CreatorDashboard from "./CreatorDashboard";
import { Spinner } from "@/components/admin/ui";

export const metadata = {
  title: "Creator dashboard | FIL",
  robots: { index: false, follow: false },
};

export default function CreatorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner /></div>}>
      <CreatorDashboard />
    </Suspense>
  );
}
