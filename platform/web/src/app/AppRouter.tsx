import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { LegacyRedirect } from "../features/navigation/LegacyRedirect";
import { AppShell } from "../features/shell/AppShell";

const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const CatalogPage = lazy(() => import("../features/curriculum/CatalogPage"));
const LessonPage = lazy(() => import("../features/curriculum/LessonPage"));
const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
const AdminPage = lazy(() => import("../features/cms/AdminPage"));
const LibraryPage = lazy(() => import("../features/library/LibraryPage"));
const LibraryDetailPage = lazy(() => import("../features/library/LibraryDetailPage"));
const ProgressPage = lazy(() => import("../features/progress/ProgressPage"));
const TrackPage = lazy(() => import("../features/curriculum/TrackPage"));
const ProjectsPage = lazy(() => import("../features/projects/ProjectsPage"));
const CompetenciesPage = lazy(() => import("../features/competencies/CompetenciesPage"));
const CompetencyDetailPage = lazy(() => import("../features/competencies/CompetencyDetailPage"));

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { element: <ProtectedRoute />, children: [{
    element: <AppShell />, children: [
      { path: "/legacy", element: <LegacyRedirect /> },
      { index: true, element: <LegacyRedirect fallback={<DashboardPage />} /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/tracks", element: <CatalogPage /> },
      { path: "/competencies", element: <CompetenciesPage /> },
      { path: "/competencies/:slug", element: <CompetencyDetailPage /> },
      { path: "/tracks/:trackSlug", element: <TrackPage /> },
      { path: "/progress", element: <ProgressPage /> },
      { path: "/tracks/:trackSlug/lessons/:lessonSlug", element: <LessonPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/admin/lessons/:lessonId", element: <AdminPage /> },
      { path: "/concepts", element: <LibraryPage /> },
      { path: "/concepts/:slug", element: <LibraryDetailPage /> },
      { path: "/guides", element: <LibraryPage /> },
      { path: "/guides/:slug", element: <LibraryDetailPage /> },
      { path: "/resources", element: <LibraryPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  }] },
]);

export function AppRouter() {
  return <Suspense fallback={<div className="page-state">Loading the platform…</div>}><RouterProvider router={router} /></Suspense>;
}
