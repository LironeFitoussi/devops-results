import type { RouteObject as ReactRouterRouteObject } from "react-router";
import { routeConfig, convertToRouterRoutes } from "./config/routesConfig";
import Layout from "./pages/Layout";

// Convert route config to React Router format
const childRoutes = convertToRouterRoutes(routeConfig) as ReactRouterRouteObject[];

export const routes: ReactRouterRouteObject[] = [
  {
    path: "/",
    Component: Layout,
    children: childRoutes,
  },
];
