import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";


import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./admin.css";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("history") ? localStorage.getItem("history") : null;

    useEffect(() => {
        if (token) {
          navigate(token, { replace: true });
        } else {
          localStorage.setItem("history", "")
          navigate("/admin/dashboard", { replace: true }); // Default landing page
        }
    }, []);
      
    // Store history only when pathname changes
    useEffect(() => {
      if (location.pathname !== "/admin") { // Avoid storing layout-only paths
        const updatedHistory = location.pathname;
        localStorage.setItem("history", updatedHistory);
      }
    }, [location.pathname]);

    return (
    <div>
        <Navbar />
        <Sidebar />
        <div className="adminPage">
        <Outlet />
        </div>
    </div>
    );
};

export default AdminLayout;