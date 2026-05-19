import type { ComponentType, ReactNode } from "react";
import { ClipboardList, FileText, GraduationCap, Home, LayoutDashboard } from "lucide-react";
import type { SVGProps } from "react";
import HomePage, { HomePageLoader } from "../pages/HomePage";
import GoogleFormsPage from "../pages/GoogleFormsPage";
import GoogleFormResultsPage from "../pages/GoogleFormResultsPage";
import ExamsPage from "../pages/ExamsPage";
import ExamResultsPage from "../pages/ExamResultsPage";
import ExamSubmissionReviewPage from "../pages/ExamSubmissionReviewPage";
import StudentExamsPage from "../pages/StudentExamsPage";
import StudentExamReviewPage from "../pages/StudentExamReviewPage";
import StudentsPage from "../pages/StudentsPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";

// Type for Lucide icons
export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

// Define RouteObject type locally - compatible with react-router
export type RouteObject = {
  path?: string;
  index?: boolean;
  Component?: ComponentType;
  loader?: () => Promise<unknown> | unknown;
  children?: RouteObject[];
};

export interface RouteConfig {
  path: string;
  name: string;
  Component?: ComponentType;
  loader?: () => Promise<unknown> | unknown;
  icon?: LucideIcon;
  showInSidebar?: boolean;
  requireAuth?: boolean;
  requiredRole?: string;
  index?: boolean;
  children?: RouteConfig[];
}

// Define all routes in one place
export const routeConfig: RouteConfig[] = [
  {
    path: "/",
    name: "Home",
    Component: HomePage,
    loader: HomePageLoader,
    icon: Home,
    showInSidebar: true,
    index: true,
  },
  {
    path: "/student-dashboard",
    name: "Dashboard",
    Component: StudentDashboardPage,
    icon: LayoutDashboard,
    showInSidebar: true,
    requireAuth: true,
    requiredRole: "student",
  },
  {
    path: "/student-exams",
    name: "My Exams",
    Component: StudentExamsPage,
    icon: ClipboardList,
    showInSidebar: true,
    requireAuth: true,
    requiredRole: "student",
  },
  {
    path: "/google-forms",
    name: "Google Forms",
    Component: GoogleFormsPage,
    icon: FileText,
    showInSidebar: true,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/exams",
    name: "Exams",
    Component: ExamsPage,
    icon: ClipboardList,
    showInSidebar: true,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/students",
    name: "Students",
    Component: StudentsPage,
    icon: GraduationCap,
    showInSidebar: true,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/google-forms/:formId",
    name: "Google Form Results",
    Component: GoogleFormResultsPage,
    showInSidebar: false,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/exams/:examId",
    name: "Exam Results",
    Component: ExamResultsPage,
    showInSidebar: false,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/exams/:examId/review/:resultId",
    name: "Submission Review",
    Component: ExamSubmissionReviewPage,
    showInSidebar: false,
    requireAuth: true,
    requiredRole: "admin",
  },
  {
    path: "/student-exams/:resultId",
    name: "Exam Review",
    Component: StudentExamReviewPage,
    showInSidebar: false,
    requireAuth: true,
    requiredRole: "student",
  },
];

function getRouteComponent(route: RouteConfig): ComponentType | undefined {
  if (!route.Component) {
    return undefined;
  }

  if (!route.requireAuth && !route.requiredRole) {
    return route.Component;
  }

  const RouteComponent = route.Component;

  return function ProtectedRouteComponent() {
    return (
      <ProtectedRoute requiredRole={route.requiredRole}>
        <RouteComponent />
      </ProtectedRoute>
    );
  };
}

// Convert route config to React Router format
export function convertToRouterRoutes(config: RouteConfig[]): RouteObject[] {
  return config.map((route) => {
    const Component = getRouteComponent(route);

    // Handle index routes - they shouldn't have a path
    if (route.index) {
      return {
        index: true as const,
        Component,
        loader: route.loader,
        children: route.children && route.children.length > 0 
          ? convertToRouterRoutes(route.children) 
          : undefined,
      } as RouteObject;
    }

    return {
      path: route.path,
      Component,
      loader: route.loader,
      children: route.children && route.children.length > 0 
        ? convertToRouterRoutes(route.children) 
        : undefined,
    } as RouteObject;
  });
}

// Get sidebar menu items from route config
export interface SidebarMenuItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  subMenus?: SidebarSubMenuItem[];
  requireAuth?: boolean;
  requiredRole?: string;
}

export interface SidebarSubMenuItem {
  label: string;
  path: string;
  requireAuth?: boolean;
  requiredRole?: string;
}

// Helper function to resolve full path for nested routes
function resolvePath(childPath: string, parentPath: string): string {
  // If child path is already absolute, return it
  if (childPath.startsWith("/")) {
    return childPath;
  }
  // Otherwise, combine with parent path
  const parentBase = parentPath.endsWith("/") ? parentPath.slice(0, -1) : parentPath;
  return `${parentBase}/${childPath}`;
}

export function getSidebarMenuItems(
  config: RouteConfig[],
  isAuthenticated: boolean = false,
  userRole?: string
): SidebarMenuItem[] {
  const menuItems: SidebarMenuItem[] = [];

  config.forEach((route) => {
    // Skip routes that shouldn't be shown in sidebar
    if (!route.showInSidebar) return;

    // Check authentication requirements
    if (route.requireAuth && !isAuthenticated) return;
    if (route.requiredRole && userRole !== route.requiredRole) return;

    // If route has children that should be shown in sidebar, create a menu item with sub-menus
    const sidebarChildren = route.children?.filter((child) => child.showInSidebar);
    
    if (sidebarChildren && sidebarChildren.length > 0) {
      const subMenus: SidebarSubMenuItem[] = sidebarChildren
        .filter((child) => {
          if (child.requireAuth && !isAuthenticated) return false;
          if (child.requiredRole && userRole !== child.requiredRole) return false;
          return true;
        })
        .map((child) => {
          // For index routes, use the parent path
          let childPath = child.path;
          if (child.index) {
            childPath = route.path;
          } else {
            childPath = resolvePath(child.path, route.path);
          }
          return {
            label: child.name,
            path: childPath,
            requireAuth: child.requireAuth,
            requiredRole: child.requiredRole,
          };
        });

      menuItems.push({
        label: route.name,
        path: route.Component ? route.path : undefined, // Only set path if it has a component
        icon: route.icon ? <route.icon className="w-5 h-5" /> : undefined,
        subMenus: subMenus.length > 0 ? subMenus : undefined,
        requireAuth: route.requireAuth,
        requiredRole: route.requiredRole,
      });
    } else if (route.Component) {
      // Single menu item without sub-menus
      menuItems.push({
        label: route.name,
        path: route.path,
        icon: route.icon ? <route.icon className="w-5 h-5" /> : undefined,
        requireAuth: route.requireAuth,
        requiredRole: route.requiredRole,
      });
    }
  });

  return menuItems;
}

