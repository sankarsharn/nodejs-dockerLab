import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiBook,
    FiUsers,
    FiRefreshCw,
    FiAlertTriangle,
    FiLogOut,
    FiUser,
    FiMenu,
    FiX
} from 'react-icons/fi';
import { useState } from 'react';
import './Layout.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/books', icon: FiBook, label: 'Books' },
        { path: '/members', icon: FiUsers, label: 'Members' },
        { path: '/transactions', icon: FiRefreshCw, label: 'Transactions' },
        { path: '/overdue', icon: FiAlertTriangle, label: 'Overdue' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">📚</span>
                    {!isCollapsed && <span className="logo-text">LibraryMS</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <FiMenu /> : <FiX />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon className="nav-icon" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        <FiUser />
                    </div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    )}
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
