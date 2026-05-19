import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUser } from '../redux/slices/userSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { Auth0User } from '@/types';
import api from '@/services/api';
import { LoadingSpinner } from '@/components/Atoms';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated, user, getAccessTokenSilently, isLoading: auth0Loading } = useAuth0();

  useEffect(() => {
    const initializeApp = async () => {
      // Only initialize if Auth0 has finished loading and user is authenticated
      if (!auth0Loading && isAuthenticated && user) {
        // Set API headers with token
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: 'openid profile email',
            }
          });
          
          const bearerToken = `Bearer ${token}`;
          api.defaults.headers.common['Authorization'] = bearerToken;
          
          // Fetch user data
          dispatch(fetchUser({
            userData: user as Auth0User,
            token: token as string,
          }));
        } catch (error) {
          console.error('Failed to set API headers:', error);
        }
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated, user, getAccessTokenSilently, auth0Loading]);

  // Show loading state while Auth0 is initializing
  if (auth0Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Initializing authentication..." />
      </div>
    );
  }

  // Show loading state while fetching user (only if authenticated)
  if (isAuthenticated && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading user data..." />
      </div>
    );
  }

  // Show error state if user fetch failed
  if (error && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load user</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              if (user) {
                dispatch(fetchUser({
                  userData: user as Auth0User,
                }));
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render children when authentication state is determined and user is loaded (if authenticated)
  return <>{children}</>;
};

export default AppInitializer;
