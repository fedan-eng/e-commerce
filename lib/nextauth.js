import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
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
          await user.save();
        }
      } else {
        user = await User.create({
          email: profile.email,
          googleId: account.providerAccountId,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          provider: "google",
          password: "",
        });
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      // Only runs on initial sign-in when account/profile are present
      if (account && profile) {
        await connectDB();
        const user = await User.findOne({ email: profile.email }).lean();

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
      // Expose whatever your app needs from the token
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        firstName: token.firstName,
        lastName: token.lastName,
        country: token.country,
        phone: token.phone,
        address: token.address,
        city: token.city,
        region: token.region,
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
