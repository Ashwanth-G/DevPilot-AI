"use client";

/**
 * Providers
 *
 * This component wraps the entire application with the
 * global providers required by DevPilot AI.
 *
 * Providers used:
 *
 * 1. ThemeProvider
 *    → Handles dark/light theme using next-themes.
 *
 * 2. QueryClientProvider
 *    → Provides TanStack React Query throughout the app.
 *
 * 3. Toaster
 *    → Provides toast notifications using Sonner.
 *
 * 4. ReactQueryDevtools
 *    → Development-only tools for inspecting React Query.
 *
 * 5. Auth initialization
 *    → Loads the current authentication state when
 *      the application starts.
 */

import { useEffect, useState } from "react";

import { ThemeProvider } from "next-themes";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "sonner";

import { useAuthStore } from "@/stores/auth-store";


/**
 * Providers Props
 *
 * children = all pages/components inside the application.
 */
interface ProvidersProps {
  children: React.ReactNode;
}


/**
 * Global application providers.
 */
export function Providers({ children }: ProvidersProps) {

  // ─────────────────────────────────────────────────────────
  // Authentication initialization
  // ─────────────────────────────────────────────────────────
  //
  // Get the initialize function from our Zustand auth store.
  //
  // This is responsible for checking/loading the user's
  // authentication state when the application starts.
  //
  const initializeAuth = useAuthStore(
    (state) => state.initialize
  );


  // Run authentication initialization once when the
  // Providers component is mounted.
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);


  // ─────────────────────────────────────────────────────────
  // TanStack Query Client
  // ─────────────────────────────────────────────────────────
  //
  // QueryClient manages:
  //
  // - API requests
  // - caching
  // - loading states
  // - errors
  // - refetching
  //
  // useState ensures that we create ONE QueryClient
  // instance for this mounted application.
  //
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {

          // ────────────────────────────────────────────────
          // Query configuration
          // ────────────────────────────────────────────────
          queries: {

            // Keep successful data fresh for 30 seconds.
            //
            // During this period React Query can use cached
            // data instead of immediately requesting it again.
            staleTime: 30 * 1000,

            // Retry failed requests once.
            retry: 1,

            // Don't automatically refetch every time the
            // browser window receives focus.
            refetchOnWindowFocus: false,
          },


          // ────────────────────────────────────────────────
          // Mutation configuration
          // ────────────────────────────────────────────────
          mutations: {

            // Don't automatically retry mutations.
            //
            // For example, if a POST request fails, we don't
            // want to accidentally execute the operation again.
            retry: 0,
          },
        },
      })
  );


  // ─────────────────────────────────────────────────────────
  // Render application
  // ─────────────────────────────────────────────────────────

  return (
    <ThemeProvider
      // Store the theme using the "class" attribute.
      //
      // Example:
      // <html class="dark">
      //
      attribute="class"

      // DevPilot starts in dark mode.
      defaultTheme="dark"

      // Don't automatically follow the operating system theme.
      enableSystem={false}

      // Prevent ugly transitions when changing themes.
      disableTransitionOnChange
    >

      <QueryClientProvider client={queryClient}>

        {/* ────────────────────────────────────────────────
            Application
            ──────────────────────────────────────────────── */}

        {children}


        {/* ────────────────────────────────────────────────
            Sonner Toast Notifications
            ────────────────────────────────────────────────
            
            Used for messages such as:
            
            - Login successful
            - Deployment failed
            - Docker container stopped
            - GitHub connection successful
            - API errors
        */}

        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(222 40% 9%)",
              border: "1px solid hsl(222 30% 16%)",
              color: "hsl(210 40% 95%)",
            },
          }}
        />


        {/* ────────────────────────────────────────────────
            React Query DevTools
            ────────────────────────────────────────────────
            
            Only rendered while running the application
            in development mode.
            
            It allows you to inspect:
            
            - Queries
            - Cached data
            - Query status
            - Mutations
            - Refetching
        */}

        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}

      </QueryClientProvider>

    </ThemeProvider>
  );
}