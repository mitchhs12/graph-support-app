import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(time: any) {
  const seconds = Math.floor((new Date().getTime() - time.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

export function getReadableDate(date: number) {
  const readableDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // You can set this to false for 24-hour time format
  }).format(date);
  return readableDate;
}

export function checkBlockHash(blockHash: string) {
  const blockHashRegex = /^0x([A-Fa-f0-9]{64})$/;
  return blockHashRegex.test(blockHash);
}

export function modifyNodeName(currentNode: string) {
  const lastChar = currentNode[currentNode.length - 1];
  const secondLastChar = currentNode[currentNode.length - 2];

  // Check if the second last character is an underscore and the last character is a number
  if (secondLastChar === "_" && !isNaN(parseInt(lastChar, 10))) {
    // Subtract 1 from the last character (if it's greater than 0)
    const number = parseInt(lastChar, 10);
    const newLastChar = number > 0 ? (number - 1).toString() : lastChar;

    // Create the new node by replacing the last character with the adjusted value
    return currentNode.slice(0, -1) + newLastChar;
  }

  // If conditions are not met, return the current node name
  return currentNode;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      console.error("Failed to refresh access token", await response.text());
      return null;
    }

    const refreshedTokens = await response.json();
    return {
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // Calculate the expiration time
      refreshToken: refreshedTokens.refresh_token || refreshToken, // Fallback to the old refresh token if none is returned
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return null;
  }
}
