import React from "react";
import { useTheme } from "../theme/useTheme";

export default function Footer() {
  const theme = useTheme();

  return (
    <footer
      style={{
        backgroundColor: theme.surface,
        color: theme.text,
        transition: "background-color 1.5s ease, color 1.5s ease"
      }}
      className="mt-16 p-6 text-center"
    >
      © {new Date().getFullYear()} MoodMate. All Rights Reserved.
    </footer>
  );
}
