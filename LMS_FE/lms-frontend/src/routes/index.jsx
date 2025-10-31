import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MaterialsPublished from "../pages/MaterialsPublished";
import MaterialsUpload from "../pages/MaterialsUpload";
import MaterialsManage from "../pages/MaterialsManage";
import MaterialView from "../pages/MaterialView";
import Materials from "../pages/Materials";
import Users from "../pages/Users";
import Roles from "../pages/Roles";
import Actions from "../pages/Actions";
import NotFound from "../pages/NotFound";

export default function AppRoutes({ user, error, menu, doLogin, doLogout }) {
  return (
    <Routes>
      {/* Redirect root path based on auth status */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public route - Login */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={doLogin} error={error} />
          )
        } 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/published"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <MaterialsPublished />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/upload"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <MaterialsUpload />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Materials />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/list"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Materials />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/manage"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <MaterialsManage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/materials/view/:id"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <MaterialView />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Users />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/roles"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Roles />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/actions"
        element={
          <ProtectedRoute user={user}>
            <AppLayout user={user} menu={menu} onLogout={doLogout}>
              <Actions />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
