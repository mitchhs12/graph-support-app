declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string; // Add refreshToken to JWT
  }

  interface Account {
    access_token?: string; // Ensure the account type includes access_token
    refresh_token?: string; // Add refresh_token to Account
  }
}
