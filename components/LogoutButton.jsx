"use client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser, logoutGoogleUser } from "@/store/features/authSlice";
import { useSession } from "next-auth/react";

const LogoutButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const handleLogout = async () => {
    // Use Google logout if user is authenticated via NextAuth
    const logoutAction = session ? logoutGoogleUser : logoutUser;
    const result = await dispatch(logoutAction());

    if (logoutAction.fulfilled.match(result)) {
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
