"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // When mounted on client, now we can show the UI
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${
          theme === "light" ? "bg-orange-100 text-orange-500" : "bg-transparent"
        }`}
        aria-label="Use light theme"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${
          theme === "dark" ? "bg-orange-900 text-orange-500" : "bg-transparent"
        }`}
        aria-label="Use dark theme"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  );
}
