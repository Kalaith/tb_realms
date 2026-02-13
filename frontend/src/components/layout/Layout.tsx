import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

/**
 * Main Layout Component
 * Provides layout structure with simplified navigation
 */
const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation component */}
      <Navigation />

      {/* Main content area with padding-top to account for fixed nav */}
      <div className="flex flex-col flex-1 w-full overflow-hidden pt-16">
        {/* Main content with outlet for nested routes */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Simple footer */}
        <footer className="py-3 text-center text-sm text-gray-500 border-t dark:text-gray-400 dark:border-gray-700">
          <p>
            © {new Date().getFullYear()} Tradeborn Realms. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
