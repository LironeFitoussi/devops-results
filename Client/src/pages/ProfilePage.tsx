import { useAuth0 } from "@auth0/auth0-react";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { validateToken } from "@/services/auth";
import { useState } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const { user: userState } = useAppSelector((state) => state.user);
  const [isValidToken, setIsValidToken] = useState(false);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleCheckJWTToken = async () => {
    try {
    //   console.log(import.meta.env.VITE_AUTH0_AUDIENCE);
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email',
        }
      });
    //   console.log(token);
      const response = await validateToken(token);
      if (response.success) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'error' in error && error.error === 'consent_required') {
        // Redirect to login with consent prompt
        window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/authorize?` +
          `response_type=code&` +
          `client_id=${import.meta.env.VITE_AUTH0_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
          `scope=openid profile email&` +
          `audience=${import.meta.env.VITE_AUTH0_AUDIENCE}&` +
          `prompt=consent`;
      } else {
        console.error('Error getting token:', error);
      }
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          {userState?.profilePicture && (
            <img
              src={userState.profilePicture}
              alt={userState.name}
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{userState?.firstName} {userState?.lastName}</h2>
            <p className="text-gray-600">{userState?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {userState?.auth0Id}</p>
          <p><strong>Email Verified:</strong> {user?.email_verified ? 'Yes' : 'No'}</p>
          <p><strong>Last Updated:</strong> {userState?.updatedAt}</p>
          <p><strong>Role:</strong> {userState?.role}</p>
          <p><strong>Created At:</strong> {userState?.createdAt}</p>
          {userState?.phone && <p><strong>Phone:</strong> {userState?.phone}</p>}
        </div>

        <div>
            {/* Check JWT token */}
            <Button onClick={handleCheckJWTToken}>Check JWT Token</Button>
            {isValidToken && <p>Token is valid</p>}
            {!isValidToken && <p>Token is invalid</p>}
        </div>
      </div>
    </div>
  );
}
