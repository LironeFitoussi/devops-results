import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUser, setError } from '../redux/slices/userSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { Auth0User } from '@/types';
import api from '@/services/api';
import { LoadingSpinner } from '@/components/Atoms';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user: appUser, loading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated, user, getAccessTokenSilently, isLoading: auth0Loading } = useAuth0();

  useEffect(() => {
    const initializeApp = async () => {
      if (auth0Loading) {
        return;
      }

      if (!isAuthenticated) {
        delete api.defaults.headers.common['Authorization'];
        return;
      }

      if (user) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: 'openid profile email',
            }
          });

          const bearerToken = `Bearer ${token}`;
          api.defaults.headers.common['Authorization'] = bearerToken;

          dispatch(fetchUser({
            userData: user as Auth0User,
            token: token as string,
          }));
        } catch (error) {
          console.error('Failed to set API headers:', error);
          dispatch(setError('Failed to initialize authentication'));
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
  if (isAuthenticated && (loading || (!appUser && !error))) {
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
            onClick={async () => {
              if (user) {
                const token = await getAccessTokenSilently({
                  authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    scope: 'openid profile email',
                  },
                });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(fetchUser({
                  userData: user as Auth0User,
                  token,
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
