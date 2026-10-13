"use client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/features/authSlice";

const LogoutButton = ({ className, children = "Logout" }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      // ✅ Soft navigation — no full page reload, no remount race condition.
      // window.location.href was causing AuthInitializer to remount and
      // dispatch fetchUser before the browser committed the cleared cookie,
      // resulting in a ghost fulfilled auth state after logout.
      router.push("/login");
    } else {
      console.error("Logout failed:", result.payload);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className ?? "block w-full text-left py-2 pl-3 border-[#E5E5E5] border-t text-black hover:text-mustard text-sm hover:underline cursor-pointer"}
    >
      {children}
    </button>
  );
};

export default LogoutButton;