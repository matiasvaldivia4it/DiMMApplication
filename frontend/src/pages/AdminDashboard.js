import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const apiGateway = window.__ENV__?.REACT_APP_API_GATEWAY || process.env.REACT_APP_API_GATEWAY || 'http://localhost:4000';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${apiGateway}/api/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus, currentSubscription) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`${apiGateway}/api/auth/users/${userId}/status`,
                {
                    is_active: !currentStatus,
                    subscription_status: currentSubscription
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Error updating user status');
        }
    };

    const toggleSubscription = async (userId, currentActive, currentSubscription) => {
        const newSubscription = currentSubscription === 'premium' ? 'free' : 'premium';
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`${apiGateway}/api/auth/users/${userId}/status`,
                {
                    is_active: currentActive,
                    subscription_status: newSubscription
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Error updating subscription');
        }
    };

    const promoteUser = async (userId, currentRole) => {
        if (!window.confirm('Are you sure you want to change this user role?')) return;

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`${apiGateway}/api/auth/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Error updating role');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800">
                        &larr; Back to App
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={u.picture || 'https://via.placeholder.com/40'} alt="" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {u.is_active ? 'Active' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.subscription_status === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {u.subscription_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => toggleStatus(u.id, u.is_active, u.subscription_status)}
                                            className={`${u.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        >
                                            {u.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => toggleSubscription(u.id, u.is_active, u.subscription_status)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            {u.subscription_status === 'premium' ? 'Downgrade' : 'Upgrade'}
                                        </button>
                                        <button
                                            onClick={() => promoteUser(u.id, u.role)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
