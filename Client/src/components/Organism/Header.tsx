import { Link } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";

export default function Header() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const { user } = useAppSelector((state) => state.user);

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <nav className="bg-white/20 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-lg border border-white/30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300"
          >
            YourApp
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                  />
                )}
                <span className="text-gray-700 font-medium hidden md:inline">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-gray-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => loginWithRedirect()}
                className="bg-white/90 hover:bg-white text-blue-600 shadow-sm hover:shadow-md transition-all duration-300"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

