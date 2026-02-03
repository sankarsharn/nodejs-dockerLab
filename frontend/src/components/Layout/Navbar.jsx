import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiBook,
    FiUsers,
    FiRefreshCw,
    FiAlertTriangle,
    FiLogOut,
    FiUser,
    FiLogIn,
    FiGrid
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Check if user is staff (admin or librarian)
    const isStaff = user?.role === 'admin' || user?.role === 'librarian';

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">LibraryMS</span>
                </Link>

                <nav className="navbar-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                        <FiHome /> Home
                    </NavLink>

                    {isAuthenticated && (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <FiGrid /> Dashboard
                            </NavLink>
                            <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <FiBook /> Books
                            </NavLink>

                            {/* Staff-only links */}
                            {isStaff && (
                                <>
                                    <NavLink to="/members" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <FiUsers /> Members
                                    </NavLink>
                                    <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <FiRefreshCw /> Transactions
                                    </NavLink>
                                    <NavLink to="/overdue" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <FiAlertTriangle /> Overdue
                                    </NavLink>
                                </>
                            )}

                            {/* Student-only links */}
                            {user?.role === 'student' && (
                                <NavLink to="/my-books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <FiBook /> My Books
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <div className="user-info">
                                <FiUser className="user-icon" />
                                <span className="user-name">{user?.name}</span>
                                <span className={`user-role role-${user?.role}`}>{user?.role}</span>
                            </div>
                            <button className="btn-logout" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login">
                            <FiLogIn /> Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
