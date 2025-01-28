import Header from "@/components/Header";
import getSession from "@/lib/getSession";
import SubgraphSearch from "@/components/SubgraphSearch";
import { signIn } from "next-auth/react";

export default async function Home() {
  const session = await getSession();
  if (session?.error === "RefreshAccessTokenError") {
    signIn();
  }
  const email = session?.user?.email;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col gap-3 items-center justify-center flex-grow">
        {!email ? (
          <div className="text-center">
            <h1>Login with your E&N email to get started</h1>
          </div>
        ) : email && !email.endsWith("@edgeandnode.com") ? (
          <div className="text-center">
            <h1>You are not authorized to access this page.</h1>
          </div>
        ) : (
          <SubgraphSearch />
        )}
      </main>
    </div>
  );
}
