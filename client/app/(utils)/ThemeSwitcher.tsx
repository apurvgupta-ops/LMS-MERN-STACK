"use client";
import React, { FC } from "react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { BiMoon, BiSun } from "react-icons/bi";

interface ThemeSwitcherProps {}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = ({}) => {
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }
  return (
    <div className="flex items-center justify-center mx-4">
      {theme === "light" ? (
        <BiMoon
          className="cursor-pointer"
          fill="black"
          size={25}
          onClick={() => setTheme("dark")}
        />
      ) : (
        <BiSun
          className="cursor-pointer"
          size={25}
          onClick={() => setTheme("light")}
        />
      )}
    </div>
  );
};
