"use client";

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          {theme === "light" ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className="text-foreground/70"
            />
          ) : theme === "dark" ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className="text-foreground/70"
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className="text-foreground/70"
            />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Theme selection">
        <DropdownItem key="light" onClick={() => setTheme("light")} startContent={<Sun size={ICON_SIZE} />}>
          Light
        </DropdownItem>
        <DropdownItem key="dark" onClick={() => setTheme("dark")} startContent={<Moon size={ICON_SIZE} />}>
          Dark
        </DropdownItem>
        <DropdownItem key="system" onClick={() => setTheme("system")} startContent={<Laptop size={ICON_SIZE} />}>
          System
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export { ThemeSwitcher };
