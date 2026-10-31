import { redirect } from "next/navigation";

// Orders live in the account area now
export default function OrdersPage() {
  redirect("/profile?tab=My%20Orders");
}
