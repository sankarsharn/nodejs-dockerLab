import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
    FiBook,
    FiUsers,
    FiRefreshCw,
    FiAlertTriangle,
    FiTrendingUp,
    FiDollarSign,
    FiClock,
    FiCheckCircle
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, recentRes, categoryRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getRecent(),
                dashboardAPI.getCategories()
            ]);
            setStats(statsRes.data);
            setRecentActivity(recentRes.data);
            setCategoryStats(categoryRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner large"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    const statCards = [
        {
            icon: FiBook,
            label: 'Total Books',
            value: stats?.totalBooks || 0,
            color: '#667eea',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: FiUsers,
            label: 'Total Members',
            value: stats?.totalMembers || 0,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
        {
            icon: FiRefreshCw,
            label: 'Active Issues',
            value: stats?.activeIssues || 0,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        },
        {
            icon: FiAlertTriangle,
            label: 'Overdue Books',
            value: stats?.overdueBooks || 0,
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        },
    ];

    const additionalStats = [
        { icon: FiTrendingUp, label: 'Available Books', value: stats?.availableBooks || 0 },
        { icon: FiClock, label: 'Today\'s Issues', value: stats?.todayIssues || 0 },
        { icon: FiCheckCircle, label: 'Today\'s Returns', value: stats?.todayReturns || 0 },
        { icon: FiDollarSign, label: 'Pending Fines', value: `₹${stats?.pendingFines || 0}` },
    ];

    return (
        <div className="page-container">
            <div className="dashboard">
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's what's happening in your library.</p>
                </div>

                {/* Main Stats */}
                <div className="stats-grid">
                    {statCards.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ '--card-gradient': stat.gradient }}>
                            <div className="stat-icon" style={{ background: stat.gradient }}>
                                <stat.icon />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Stats */}
                <div className="additional-stats">
                    {additionalStats.map((stat, index) => (
                        <div key={index} className="mini-stat">
                            <stat.icon className="mini-stat-icon" />
                            <span className="mini-stat-value">{stat.value}</span>
                            <span className="mini-stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {/* Recent Activity */}
                    <div className="card recent-activity">
                        <div className="card-header">
                            <h3 className="card-title">Recent Activity</h3>
                        </div>
                        <div className="activity-list">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((transaction, index) => (
                                    <div key={index} className="activity-item">
                                        <div className={`activity-icon ${transaction.status}`}>
                                            {transaction.status === 'returned' ? <FiCheckCircle /> : <FiRefreshCw />}
                                        </div>
                                        <div className="activity-details">
                                            <span className="activity-title">
                                                {transaction.book?.title || 'Unknown Book'}
                                            </span>
                                            <span className="activity-meta">
                                                {transaction.status === 'returned' ? 'Returned by' : 'Issued to'}{' '}
                                                {transaction.member?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        <span className={`activity-status ${transaction.status}`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Stats */}
                    <div className="card category-stats">
                        <div className="card-header">
                            <h3 className="card-title">Books by Category</h3>
                        </div>
                        <div className="category-list">
                            {categoryStats.length > 0 ? (
                                categoryStats.map((category, index) => (
                                    <div key={index} className="category-item">
                                        <div className="category-info">
                                            <span className="category-name">{category._id}</span>
                                            <span className="category-count">{category.count} books</span>
                                        </div>
                                        <div className="category-bar">
                                            <div
                                                className="category-bar-fill"
                                                style={{
                                                    width: `${(category.count / Math.max(...categoryStats.map(c => c.count))) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No categories found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
