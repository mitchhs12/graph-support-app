import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { refreshGoogleAccessToken } from "@/lib/utils";
import { getReadableDate } from "@/lib/utils";

console.log("Auth Secret:", process.env.AUTH_SECRET);

//@ts-expect-error NextAuth is not callable
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/cloud-platform", // Add the required scopes here
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
        token.refreshToken = account.refresh_token;
        console.log("initial token");
        return token;
      }
      // Return the token if it is not expired
      if (Date.now() < token.accessTokenExpires) {
        console.log(getReadableDate(Date.now()));
        console.log(getReadableDate(token.accessTokenExpires));
        console.log("token not expired!");
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("token expired");
      const refreshedToken = await refreshGoogleAccessToken(token.refreshToken as string);

      if (refreshedToken) {
        token.accessToken = refreshedToken.accessToken;
        token.accessTokenExpires = refreshedToken.accessTokenExpires;
        token.refreshToken = refreshedToken.refreshToken;
      } else {
        console.error("Failed to refresh token");
        // Return the old token if refresh fails
        token.error = "RefreshAccessTokenError";
      }
      return token;
    },

    async session({ session, token }: any) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
