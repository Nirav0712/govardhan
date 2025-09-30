import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Calendar, Clock, Users, MapPin, Phone, Eye, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

// Helper functions for date and time formatting
const formatReservationDate = (dateString) => {
    try {
        if (!dateString) return 'N/A';
        
        // Handle ISO string format
        if (dateString.includes('T') || dateString.includes('Z')) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Handle other date formats
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString || 'N/A';
    }
};

const formatReservationTime = (timeString) => {
    try {
        if (!timeString) return 'N/A';
        
        // Handle ISO string format with time
        if (timeString.includes('T') || timeString.includes('Z')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        
        // Handle simple time format (HH:MM)
        if (timeString.match(/^\d{1,2}:\d{2}$/)) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        
        return timeString;
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString || 'N/A';
    }
};

const formatCreatedDate = (dateString) => {
    try {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting created date:', error);
        return dateString || 'N/A';
    }
};

const ReservationsPage = () => {
    // Add error boundary state
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Error boundary effect
    useEffect(() => {
        const errorHandler = (error) => {
            console.error('Error in ReservationsPage:', error);
            setHasError(true);
            setErrorMessage(error.message || 'An error occurred');
            setLoading(false);
        };

        // Handle any uncaught errors
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {errorMessage || 'An error occurred while loading reservations.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                            >
                                Try again →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, getAllReservations } = useAppContext();

    useEffect(() => {
        // Check for admin authentication
        const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
        const adminUser = localStorage.getItem('govardhanthal_admin_user');
        
        if (adminToken && adminUser) {
            try {
                const adminData = JSON.parse(adminUser);
                if (adminData.role === 'admin') {
                    loadReservations();
                } else {
                    setError('Access denied. Admin privileges required.');
                    setLoading(false);
                }
            } catch (error) {
                setError('Invalid admin data. Please login again.');
                setLoading(false);
            }
        } else {
            setError('Please login as admin to view reservations.');
            setLoading(false);
        }
    }, []);

    const loadReservations = async (filters = {}) => {
        try {
            setLoading(true);
            setError('');

            const result = await getAllReservations(filters);

            if (result.ok) {
                const mapped = result.data.reservations.map((r) => ({
                    id: r._id,
                    customerName: r.name,
                    phone: r.phone,
                    date: formatReservationDate(r.date),
                    time: formatReservationTime(r.time),
                    status: r.status,
                    isVerified: r.isVerified,
                    createdDate: formatCreatedDate(r.createdAt),
                    partySize: r.partySize || 2,
                    tableNumber: r.tableNumber || 'TBD',
                    email: r.email || '',
                    notes: r.notes || ''
                }));
                setReservations(mapped);
                toast.success(`${mapped.length} reservations loaded successfully`);
            } else {
                throw new Error(result.message || 'Failed to load reservations');
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            console.error('Error loading reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');

    const handleApprove = async (reservationId) => {
        try {
            const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
            const response = await fetch(`https://www.govardhanthal.com/api/reservations/admin/${reservationId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setReservations(reservations.map(reservation =>
                    reservation.id === reservationId
                        ? { ...reservation, status: 'confirmed' }
                        : reservation
                ));
                toast.success('Reservation approved successfully');
            } else {
                toast.error(data.message || 'Failed to approve reservation');
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Failed to approve reservation');
        }
    };

    const handleReject = async (reservationId) => {
        try {
            const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
            const response = await fetch(`https://www.govardhanthal.com/api/reservations/admin/${reservationId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setReservations(reservations.map(reservation =>
                    reservation.id === reservationId
                        ? { ...reservation, status: 'rejected' }
                        : reservation
                ));
                toast.success('Reservation rejected successfully');
            } else {
                toast.error(data.message || 'Failed to reject reservation');
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject reservation');
        }
    };

    const handleDelete = async (reservationId) => {
        try {
            const adminToken = localStorage.getItem('govardhanthal_admin_authenticated');
            const response = await fetch(`https://www.govardhanthal.com/api/reservations/admin/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state
                setReservations(reservations.filter(reservation => reservation.id !== reservationId));
                toast.success('Reservation deleted successfully');
            } else {
                toast.error(data.message || 'Failed to delete reservation');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete reservation');
        }
    };

    const handleFilterChange = () => {
        const filters = {};
        if (filterStatus !== 'All') {
            filters.status = filterStatus.toLowerCase();
        }
        if (filterDate) {
            filters.date = filterDate;
        }
        loadReservations(filters);
    };

    const filteredReservations = reservations.filter(reservation => {
        const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.phone.includes(searchTerm) ||
            (reservation.email && reservation.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || reservation.status === filterStatus;
        const matchesDate = !filterDate || reservation.date === filterDate;

        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const confirmedCount = reservations.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;
    const pendingCount = reservations.filter(r => (r.status || '').toLowerCase() === 'pending').length;
    const totalReservations = reservations.length;

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
                    <p className="text-gray-600">Error loading reservations</p>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <h3 className="font-medium">Error</h3>
                    <p>{error}</p>
                    <p className="mt-2 text-sm">Please ensure you are logged in as an admin.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
                    <p className="text-gray-600">Loading reservations...</p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
                <p className="text-gray-600">Manage table bookings and reservations</p>
            </div>

            {/* Reservation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Reservations</p>
                            <p className="text-2xl font-bold text-gray-900">{totalReservations}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-500 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-500 rounded-lg">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Guests</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reservations.reduce((sum, r) => sum + (r.partySize || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Reservations</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by customer, phone, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={loadReservations}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reservation Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Party Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    OTP
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">#{reservation.id.slice(-8)}</div>
                                            <div className="text-sm text-gray-500">Created: {reservation.createdDate}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                                            <div className="text-sm text-gray-500">{reservation.phone}</div>
                                            {reservation.email && (
                                                <div className="text-sm text-gray-500">{reservation.email}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{reservation.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{reservation.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span>{reservation.partySize} people</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                            {reservation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {reservation.otp ? (
                                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {reservation.otp}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">Verified</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {reservation.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(reservation.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                        title="Approve Reservation"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(reservation.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="Reject Reservation"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(reservation.id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                title="Delete Reservation"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => console.log('View details', reservation.id)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="View Details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredReservations.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reservations found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ReservationsPage;