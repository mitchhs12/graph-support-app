"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center p-4">
      <div className="text-xl">E&N Support</div>
      <div className="flex items-center gap-3">
        {session && session.user && session.user ? (
          <div className="flex items-center gap-3">
            <Image src={session.user.image ?? ""} alt="Profile" width={40} height={40} />
            <span className="hidden md:flex">{session.user?.email}</span>
            <Button onClick={() => signOut()}>Sign out</Button>
          </div>
        ) : (
          <Button onClick={() => signIn("google")}>Sign in with Google</Button>
        )}
      </div>
    </header>
  );
}
