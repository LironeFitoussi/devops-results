import { Outlet } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Sidebar } from "../components/Organisms/Sidebar";
import { Footer } from "../components/Organisms/Footer";
import { LoadingSpinner } from "@/components/Atoms";

export default function Layout() {
  const { isAuthenticated, isLoading } = useAuth0();

  // Wait for Auth0 to finish loading before rendering layout
  // This prevents the sidebar from flashing in/out
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && <Sidebar />}
      <div className={`flex flex-col flex-1 min-h-screen ${isAuthenticated ? "ml-64" : ""}`}>
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
