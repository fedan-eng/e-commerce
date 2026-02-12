"use client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/features/authSlice";

const LogoutButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      router.push("/");
    } else {
      console.error("Logout failed:", result.payload);
    }
  };

  return (
    <div
      onClick={handleLogout}
      className="block py-2 pl-3 border-[#E5E5E5] border-t text-black hover:text-mustard text-sm hover:underline cursor-pointer"
    >
      Logout
    </div>
  );
};

export default LogoutButton;
