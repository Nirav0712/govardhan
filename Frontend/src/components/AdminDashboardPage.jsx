// ./pages/AdminDashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanelLayout from "./admin/AdminPanelLayout";
import AdminDashboard from "./admin/AdminDashboard";
import ReservationsPage from "./admin/ReservationsPage";
import OrdersPage from "./admin/OrdersPage";
import Adminmenu from "./admin/AdminMenu";
import InventoryPage from "./admin/InventoryPage";

// ✅ Define INR → USD conversion rate
const INR_TO_USD = 0.012;

const AdminDashboardPage = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "adminlogout") {
      localStorage.removeItem("govardhanthal_admin_authenticated");
      navigate("/admin/adminlogin");
      return;
    }
    setCurrentPage(page);
  };

  const renderContent = () => {
    // ✅ Pass conversion rate to all children
    const props = { INR_TO_USD };

    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard {...props} onNavigate={handleNavigate} />;
      case "orders":
        return <OrdersPage {...props} />;
      case "reservations":
        return <ReservationsPage {...props} />;
      case "menu":
        return <Adminmenu {...props} />;
      case "inventory":
        return <InventoryPage {...props} />;
      default:
        return <AdminDashboard {...props} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminPanelLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </AdminPanelLayout>
  );
};

export default AdminDashboardPage;
