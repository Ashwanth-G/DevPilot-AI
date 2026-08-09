"use client";

/**
 * ============================================================
 * Topbar
 * ============================================================
 *
 * Top navigation bar for DevPilot AI.
 *
 * Provides:
 *
 * - Mobile menu toggle
 * - Global search
 * - Theme switching
 * - Notifications
 * - User profile menu
 * - Profile navigation
 * - Settings navigation
 * - Keyboard shortcuts
 * - Logout
 */

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Keyboard,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useAuthStore } from "@/stores/auth-store";

/**
 * ============================================================
 * Topbar Props
 * ============================================================
 */

interface TopbarProps {
  onMenuToggle: () => void;
}

/**
 * ============================================================
 * Topbar Component
 * ============================================================
 */

export function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  /**
   * ==========================================================
   * Theme
   * ==========================================================
   *
   * next-themes provides the current theme and the function
   * used to change between dark and light modes.
   */

  const { theme, setTheme } = useTheme();

  /**
   * ==========================================================
   * Mounted State
   * ==========================================================
   *
   * `theme` is not guaranteed to be available during SSR.
   *
   * If we render the Sun/Moon icon immediately, the server
   * and browser can render different icons and cause a
   * hydration mismatch.
   *
   * Therefore:
   *
   * Server:
   *     render placeholder
   *
   * Client:
   *     wait until mounted
   *
   * After mounting:
   *     render the correct theme icon.
   */

  /**
   * ==========================================================
   * Authentication State
   * ==========================================================
   *
   * Gets the currently logged-in user and logout function
   * from the Zustand authentication store.
   */

  const { user, logout } = useAuthStore();

  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <header className="h-16 flex items-center gap-4 px-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">

      {/* ======================================================
          Hamburger
          ====================================================== */}

      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="text-muted-foreground hover:text-foreground"
        id="mobile-menu-btn"
      >
        <Menu className="w-5 h-5" />

        <span className="sr-only">
          Toggle navigation menu
        </span>
      </Button>

      {/* ======================================================
          Search Bar
          ====================================================== */}

      <div className="flex-1 max-w-xl">
        <Link
          href="/chat"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:border-primary/40 hover:bg-muted/70 transition-all text-sm"
          id="global-search-btn"
        >
          <Search className="w-4 h-4" />

          <span>
            Ask DevPilot AI anything...
          </span>

          <kbd
            className="
              ml-auto hidden sm:inline-flex items-center gap-1
              px-1.5 py-0.5 text-[10px] font-mono rounded
              border border-border/50 bg-background
            "
          >
            ⌘K
          </kbd>
        </Link>
      </div>

      {/* ======================================================
          Right-side Actions
          ====================================================== */}

      <div className="flex items-center gap-2">

        {/* ====================================================
            Theme Toggle
            ==================================================== */}

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          className="text-muted-foreground hover:text-foreground"
          id="theme-toggle-btn"
        >
          <Sun className="hidden size-4.5 dark:block" />
          <Moon className="size-4.5 dark:hidden" />

          <span className="sr-only">
            Toggle theme
          </span>
        </Button>

        {/* ====================================================
            Notifications
            ==================================================== */}

        <Button
          variant="ghost"
          size="icon"
          className="
            relative
            text-muted-foreground
            hover:text-foreground
          "
          id="notifications-btn"
        >
          <Bell className="w-4.5 h-4.5" />

          <span
            className="
              absolute
              top-1.5
              right-1.5
              w-2
              h-2
              rounded-full
              bg-red-500
              ring-2
              ring-background
            "
          />
        </Button>

        {/* ====================================================
            Separator
            ==================================================== */}

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* ====================================================
            User Menu
            ==================================================== */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="
                flex items-center gap-2.5
                px-2 py-1.5
                rounded-xl
                hover:bg-accent
                transition-colors
              "
              id="user-menu-btn"
            >
              {/* Avatar */}

              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={user?.avatarUrl}
                  alt={user?.name}
                />

                <AvatarFallback
                  className="
                    bg-primary/20
                    text-primary
                    text-xs
                    font-semibold
                  "
                >
                  {user?.name?.charAt(0)?.toUpperCase() ?? "D"}
                </AvatarFallback>
              </Avatar>

              {/* User Information */}

              <div className="hidden md:flex flex-col items-start">

                <span className="text-sm font-medium leading-none">
                  {user?.name ?? "Account"}
                </span>

                <span
                  className="
                    text-[11px]
                    text-muted-foreground
                    leading-none
                    mt-0.5
                  "
                >
                  {user?.role ?? "member"}
                </span>

              </div>

              {/* Dropdown Icon */}

              <ChevronDown
                className="
                  w-4 h-4
                  text-muted-foreground
                  hidden md:block
                "
              />
            </button>
          </DropdownMenuTrigger>

          {/* ==================================================
              Dropdown Content
              ================================================== */}

          <DropdownMenuContent
            align="end"
            className="w-56"
            sideOffset={8}
          >

            {/* User Information */}

            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">

                <p className="text-sm font-medium">
                  {user?.name ?? "Account"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {user?.email ?? "Unavailable"}
                </p>

              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* =================================================
                User Navigation
                ================================================= */}

            <DropdownMenuGroup>

              {/* Profile */}

              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  id="goto-profile-link"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              {/* Settings */}

              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  id="goto-settings-link"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              {/* Keyboard Shortcuts */}

              <DropdownMenuItem id="keyboard-shortcuts-item">
                <Keyboard className="mr-2 h-4 w-4" />

                Keyboard Shortcuts

                <kbd
                  className="
                    ml-auto
                    text-[10px]
                    font-mono
                    text-muted-foreground
                  "
                >
                  ⌘/
                </kbd>
              </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* =================================================
                Logout
                ================================================= */}

            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="
                text-red-500
                focus:text-red-500
                focus:bg-red-500/10
              "
              id="logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
