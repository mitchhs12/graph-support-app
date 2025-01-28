"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    // If user is signed in, show the profile photo and sign out button
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <Image src={session.user?.image ?? "/default-avatar.png"} alt="Profile" width={40} height={40} />
          <span>{session.user?.email}</span>
        </div>
        <Button onClick={() => signOut()} className="mt-2">
          Sign out
        </Button>
      </div>
    );
  }

  // If user is not signed in, show the sign-in button
  return <Button onClick={() => signIn("google")}>Sign in with Google</Button>;
}
