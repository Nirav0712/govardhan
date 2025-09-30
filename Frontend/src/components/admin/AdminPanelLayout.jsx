import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Calendar,
    Package,
    Menu as MenuIcon,
    X,
    LogOut,
    Utensils
} from 'lucide-react';

const AdminPanelLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', id: 'dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Orders', id: 'orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Reservations', id: 'reservations', path: '/admin/reservations', icon: Calendar },
        { name: 'Inventory', id: 'inventory', path: '/admin/inventory', icon: Package },
        { name: 'Menu', id: 'menu', path: '/admin/menu', icon: MenuIcon },
        { 
            name: 'Logout', 
            id: 'adminlogout', 
            path: '/admin/login', 
            icon: LogOut,
            onClick: () => {
                localStorage.removeItem('govardhanthal_admin_authenticated');
                localStorage.removeItem('govardhanthal_admin_user');
                navigate('/admin/login');
            }
        },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <nav className="pt-6 px-3 h-full overflow-y-auto">
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2">
                            <Utensils size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Govardhan</h2>
                        <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (item.onClick) {
                                                item.onClick();
                                            } else {
                                                navigate(item.path);
                                            }
                                            setSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            isActive(item.id)
                                                ? 'bg-red-100 text-red-700 border-r-2 border-red-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className="ml-0 lg:ml-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                Welcome back, Admin
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};

export default AdminPanelLayout;
