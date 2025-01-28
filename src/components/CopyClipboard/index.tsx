"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Clipboard } from "lucide-react"; // Adjust the icon import based on your setup

interface ClipboardButtonProps {
  textToCopy: string;
}

export default function ClipboardButton({ textToCopy }: ClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      // Reset the button state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Button onClick={handleCopy} variant="secondary" size={"default"} className="flex items-center gap-2">
      {copied ? (
        <>
          <Check className="w-6 h-6" /> <p className="hidden sm:flex">Copied</p>
        </>
      ) : (
        <>
          <Clipboard className="w-6 h-6" /> <p className="hidden sm:flex">Copy</p>
        </>
      )}
    </Button>
  );
}
