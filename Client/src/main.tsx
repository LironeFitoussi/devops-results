import { createBrowserRouter, RouterProvider } from "react-router";

import { Auth0Provider } from "@auth0/auth0-react";
import { Provider } from 'react-redux'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { createRoot } from "react-dom/client";
import "./index.css";
import { routes } from "./routes";
import { store } from "./redux/store";
import AppInitializer from "./components/AppInitializer";

const router = createBrowserRouter(routes);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppInitializer>
          <RouterProvider router={router} />
        </AppInitializer>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </Auth0Provider>
  </Provider>
);
