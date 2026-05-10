import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <path d="M32 55C32 55 9 39 9 25C9 15 18 9 27 13C32 15 32 22 32 22C32 22 32 15 37 13C46 9 55 15 55 25C55 39 32 55 32 55Z"
          stroke="#4ECDC4" strokeWidth="3.5" fill="none" />
        <text x="22" y="36" fill="#FF6B6B" fontSize="22" fontFamily="Arial">$</text>
      </svg>
      <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-neon-teal via-neon-coral to-neon-purple bg-clip-text text-transparent">
        MoodMate
      </span>
    </div>
  );
}
