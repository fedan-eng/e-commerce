import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/sendWelcomeEmail";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider !== "google") return true;
      if (!profile.email_verified) return false;

      await connectDB();

      let user = await User.findOne({ email: profile.email });

      if (user) {
        if (!user.googleId) {
          user.googleId = account.providerAccountId;
          user.provider = "google";
        }
        // Ensure admin role if email matches ADMIN_EMAIL
        if (process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && user.role !== "admin") {
          user.role = "admin";
        }
        await user.save();
      } else {
        const role = profile.email === process.env.ADMIN_EMAIL ? "admin" : "user";
        user = await User.create({
          email: profile.email,
          googleId: account.providerAccountId,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          provider: "google",
          password: "",
          role,
        });

        await sendWelcomeEmail(profile.email, profile.given_name || "there");
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      // Only runs on initial sign-in when account/profile are present
      if (account && profile) {
        await connectDB();
        const user = await User.findOne({ email: profile.email }).lean();

        if (!user) {
          console.error("User not found in JWT callback for email:", profile.email);
          return token;
        }

        console.log("JWT callback - Found user:", user.email, "ID:", user._id.toString());

        // Attach your full user payload to the token
        token.id = user._id.toString();
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.country = user.country;
        token.phone = user.phone;
        token.address = user.address;
        token.city = user.city;
        token.region = typeof user.region === "string"
          ? { name: user.region, fee: 0 }
          : user.region;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback - Token:", token);
      // Expose whatever your app needs from the token
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.country = token.country;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.city = token.city;
        session.user.region = token.region;
      }
      console.log("Session callback - Session user:", session.user);
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If URL is already our callback page, don't redirect again
      if (url.includes('/auth/callback')) {
        return url;
      }
      // After successful OAuth, redirect to callback page to initialize Redux state
      const targetUrl = url || baseUrl;
      return `${baseUrl}/auth/callback?callbackUrl=${encodeURIComponent(targetUrl)}`;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler, handler as GET, handler as POST };
