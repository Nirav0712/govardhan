import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';

const AnalyticsPage = () => {
    const kpis = [
        { label: 'Revenue', value: '$45,231', change: '+12.4%', icon: DollarSign, color: 'from-green-400 to-green-600' },
        { label: 'Orders', value: '1,284', change: '+5.2%', icon: ShoppingCart, color: 'from-blue-400 to-blue-600' },
        { label: 'Customers', value: '3,910', change: '+3.1%', icon: Users, color: 'from-purple-400 to-purple-600' },
        { label: 'Engagement', value: '78%', change: '+2.0%', icon: Activity, color: 'from-orange-400 to-orange-600' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Track performance and key metrics</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Generate Report</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <p className="text-xs mt-3 font-medium text-green-600">{kpi.change} this month</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Traffic Overview</h2>
                    <span className="text-sm text-gray-500">Last 7 days</span>
                </div>
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    Chart placeholder
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;


