// src/assets/layouts/admin/adminLayout.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux"; // To get user role for validation

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Get user from Redux for role validation

  // Effect to handle initial redirection based on last visited path
  useEffect(() => {
    // Only attempt to redirect if currently at the base admin path "/admin"
    if (location.pathname === "/admin") {
      const lastVisitedAdminPath = localStorage.getItem("lastVisitedAdminPath");

      // Validate the stored path to ensure it's still an admin path
      // And ensure the current user (if any) is an admin before redirecting to an admin sub-path.
      if (lastVisitedAdminPath && lastVisitedAdminPath.startsWith("/admin/") && user?.userRole === 'admin') {
        navigate(lastVisitedAdminPath, { replace: true });
      } else {
        // If no valid history or user is not admin, redirect to default dashboard
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [location.pathname, navigate, user]); // Depend on location.pathname and user for re-evaluation

  // Effect to store the current admin sub-path in localStorage
  useEffect(() => {
    // Only store paths that are children of /admin (e.g., /admin/dashboard, /admin/employee-management)
    // and prevent storing the base /admin path itself
    if (location.pathname.startsWith("/admin/") && location.pathname !== "/admin") {
      localStorage.setItem("lastVisitedAdminPath", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div>
      <Sidebar />
      <Navbar />
      <div className="flex-1 mt-[10vh] ml-12 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;